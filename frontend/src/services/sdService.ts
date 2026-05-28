/**
 * Stable Diffusion API 服务
 * 支持文本到图像生成
 */

export interface SDConfig {
  apiKey: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
}

export interface SDGenerationRequest {
  text_prompts: Array<{
    text: string;
    weight?: number;
  }>;
  cfg_scale?: number;
  height?: number;
  width?: number;
  samples?: number;
  steps?: number;
}

export interface SDGenerationResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

/**
 * 调用Stable Diffusion生成图片
 */
export async function generateImage(
  config: SDConfig,
  prompt: string,
  negativePrompt?: string
): Promise<string> {
  const {
    apiKey,
    model = 'stable-diffusion-xl-1024-v1-0',
    width = 1024,
    height = 1024,
    steps = 30,
    cfgScale = 7
  } = config;

  if (!apiKey || apiKey.startsWith('sd-demo')) {
    throw new Error('请配置有效的Stable Diffusion API密钥');
  }

  const textPrompts = [
    {
      text: prompt,
      weight: 1.0
    }
  ];

  if (negativePrompt) {
    textPrompts.push({
      text: negativePrompt,
      weight: -1.0
    });
  }

  const requestBody: SDGenerationRequest = {
    text_prompts: textPrompts,
    cfg_scale: cfgScale,
    height,
    width,
    samples: 1,
    steps
  };

  try {
    // Stability AI 端点
    const proxyEnabled = import.meta.env.VITE_SD_PROXY_ENDPOINT;
    let endpoint: string;
    
    if (proxyEnabled) {
      // 使用代理时，路径已经包含在环境变量中
      endpoint = `${proxyEnabled.replace(/\/$/, '')}/${model}/text-to-image`;
    } else {
      // 直接调用
      endpoint = `https://api.stability.ai/v1/generation/${model}/text-to-image`;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(proxyEnabled 
          ? { 'X-API-Key': apiKey }  // 使用代理时传递API密钥
          : { 'Authorization': `Bearer ${apiKey}` })  // 直接调用时使用标准头
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Stable Diffusion API错误: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += ` - ${errorData.message || errorData.name || '未知错误'}`;
      } catch {
        errorMessage += ` - ${errorText.substring(0, 100)}`;
      }
      
      throw new Error(errorMessage);
    }

    const data: SDGenerationResponse = await response.json();
    
    if (!data.artifacts || data.artifacts.length === 0) {
      throw new Error('Stable Diffusion返回了空结果');
    }

    // 返回base64图片数据
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  } catch (error) {
    console.error('Stable Diffusion API调用失败:', error);
    throw error;
  }
}

/**
 * 构建图片生成提示词
 */
export function buildImagePrompt(
  productName: string,
  keywords: string,
  targetAudience: string,
  sceneType: 'we-media' | 'e-commerce',
  style: string = '真实照片风格'
): string {
  const sceneMap = {
    'we-media': {
      platform: '小红书/抖音',
      style: '清新、时尚、生活化、高颜值',
      elements: '自然光、简洁背景、高级感'
    },
    'e-commerce': {
      platform: '淘宝/京东',
      style: '专业、清晰、突出产品',
      elements: '纯色背景、产品特写、卖点展示'
    }
  };

  const scene = sceneMap[sceneType];
  
  let prompt = `${style}, ${scene.style}, ${scene.elements}, `;
  prompt += `${productName}, `;
  prompt += `关键词: ${keywords}, `;
  prompt += `目标受众: ${targetAudience}, `;
  prompt += `适合${scene.platform}平台, `;
  prompt += `高清, 细节丰富, 专业摄影, 8K分辨率`;
  
  return prompt;
}

/**
 * 构建负面提示词
 */
export function buildNegativePrompt(sceneType: 'we-media' | 'e-commerce'): string {
  const baseNegative = '模糊, 低质量, 像素化, 变形, 扭曲, 多余肢体, 手指畸形, 文字, 水印, 签名, 框架, 边框';
  
  if (sceneType === 'e-commerce') {
    return `${baseNegative}, 背景杂乱, 其他产品, 价格标签`;
  }
  
  return `${baseNegative}, 商业感太强, 广告感`;
}

/**
 * 生成多尺寸图片
 */
export async function generateMultipleSizes(
  config: SDConfig,
  prompt: string,
  negativePrompt: string,
  sizes: Array<{ width: number; height: number; name: string }>
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const size of sizes) {
    try {
      const imageConfig = {
        ...config,
        width: size.width,
        height: size.height
      };
      
      const imageData = await generateImage(imageConfig, prompt, negativePrompt);
      results[size.name] = imageData;
    } catch (error) {
      console.error(`生成${size.name}尺寸图片失败:`, error);
      results[size.name] = '';
    }
  }
  
  return results;
}

/**
 * 获取支持的模型列表
 */
export function getSupportedModels(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: 'stable-diffusion-xl-1024-v1-0', name: 'SDXL 1.0', description: '最高质量，1024x1024' },
    { id: 'stable-diffusion-v1-6', name: 'SD 1.6', description: '标准版本，512x512' },
    { id: 'stable-diffusion-512-v2-1', name: 'SD 2.1', description: '改进版本，512x512' },
    { id: 'stable-diffusion-768-v2-1', name: 'SD 2.1 768', description: '高分辨率，768x768' }
  ];
}
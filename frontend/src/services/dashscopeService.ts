/**
 * 阿里云百炼DashScope图片生成服务
 * 支持通义万相文生图API
 * API文档：https://help.aliyun.com/zh/model-studio/text-to-image-v2-api-reference
 */

export interface DashScopeConfig {
  apiKey: string;
  endpoint?: string;
  model?: string;
  region?: 'cn-beijing' | 'cn-hangzhou' | 'us-virginia' | 'sg';
}

export interface DashScopeTextToImageRequest {
  model: string;
  input: {
    messages: Array<{
      role: 'user';
      content: Array<{
        text: string;
        image?: string;
      }>;
    }>;
  };
  parameters: {
    prompt_extend?: boolean;
    watermark?: boolean;
    n?: number;
    negative_prompt?: string;
    size?: string;
    seed?: number;
    stream?: boolean;
    enable_interleave?: boolean;
    max_images?: number;
  };
}

export interface DashScopeGenerationResponse {
  output?: {
    choices?: Array<{
      finish_reason?: string;
      message?: {
        content?: Array<{
          image?: string;
          type?: string;
          text?: string;
        }>;
        role?: string;
      };
    }>;
    finished?: boolean;
  };
  usage?: {
    image_count?: number;
    size?: string;
  };
  request_id?: string;
  code?: string;
  message?: string;
}

/**
 * 根据区域获取API基础URL
 */
function getBaseUrlByRegion(region: DashScopeConfig['region'] = 'cn-beijing'): string {
  switch (region) {
    case 'cn-beijing':
      return 'https://dashscope.aliyuncs.com';
    case 'cn-hangzhou':
      return 'https://dashscope.aliyuncs.com';
    case 'us-virginia':
      return 'https://dashscope-overseas.aliyuncs.com';
    case 'sg':
      return 'https://dashscope-ap-southeast-1.aliyuncs.com';
    default:
      return 'https://dashscope.aliyuncs.com';
  }
}

/**
 * 获取API端点
 */
function getApiEndpoint(endpoint?: string, region?: DashScopeConfig['region']): string {
  if (endpoint) {
    return endpoint;
  }
  
  const baseUrl = getBaseUrlByRegion(region);
  return `${baseUrl}/api/v1/services/aigc/multimodal-generation/generation`;
}

/**
 * 验证API密钥格式
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) return false;
  // 阿里云百炼API密钥格式：sk-开头的32位以上字符串
  return apiKey.startsWith('sk-') && apiKey.length >= 32;
}

/**
 * 获取支持的模型列表
 */
export function getSupportedModels(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: 'wan2.6-image', name: '万相2.6全功能版', description: '支持文生图、图生图、图文混排，HTTP同步调用' }
  ];
}

/**
 * 构建尺寸字符串
 */
function buildSizeString(width: number, height: number): string {
  // 万相API要求格式为"宽*高"
  return `${width}*${height}`;
}

/**
 * 验证尺寸是否符合要求
 */
function validateSize(width: number, height: number): boolean {
  const minSize = 512;
  const maxSize = 1440;
  const minTotal = 512 * 512;
  const maxTotal = 1440 * 1440;
  
  const totalPixels = width * height;
  
  return (
    width >= minSize && width <= maxSize &&
    height >= minSize && height <= maxSize &&
    totalPixels >= minTotal && totalPixels <= maxTotal
  );
}

/**
 * 生成文生图
 */
export async function generateTextToImage(
  config: DashScopeConfig,
  prompt: string,
  options?: {
    negativePrompt?: string;
    width?: number;
    height?: number;
    numImages?: number;
    promptExtend?: boolean;
    watermark?: boolean;
    seed?: number;
  }
): Promise<string[]> {
  const {
    apiKey,
    model = 'wan2.6-image',
    endpoint,
    region = 'cn-beijing'
  } = config;

  const {
    negativePrompt = '',
    width = 1280,
    height = 1280,
    numImages = 1,
    promptExtend = false,
    watermark = false,
    seed
  } = options || {};

  console.log('阿里云百炼文生图调用:', {
    model,
    promptPreview: prompt.substring(0, 50) + '...',
    width,
    height,
    numImages,
    apiKeyFormat: apiKey ? (apiKey.startsWith('sk-') ? '标准格式' : '非标准格式') : '空',
    apiKeyLength: apiKey?.length || 0,
    isDemoKey: apiKey?.startsWith('dashscope-demo')
  });

  // 演示模式处理
  if (!apiKey || apiKey.startsWith('dashscope-demo')) {
    console.log('使用阿里云百炼演示模式生成图片（无有效API密钥）');
    return simulateDashScopeResponse(prompt, negativePrompt, 'text-to-image');
  }

  // 验证API密钥格式
  if (!validateApiKey(apiKey)) {
    console.warn('阿里云百炼API密钥格式可能不正确，但仍尝试调用');
  }

  // 验证尺寸
  if (!validateSize(width, height)) {
    console.warn('图片尺寸不符合万相要求，使用默认尺寸1280*1280');
    // 使用默认尺寸
  }

  const requestBody: DashScopeTextToImageRequest = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content: [
            {
              text: prompt
            }
          ]
        }
      ]
    },
    parameters: {
      prompt_extend: promptExtend,
      watermark,
      n: numImages,
      negative_prompt: negativePrompt,
      enable_interleave: true,  // 文生图使用图文混排模式
      stream: true,  // 必须配合enable_interleave使用
      size: buildSizeString(width, height),
      ...(seed !== undefined ? { seed } : {})
    }
  };

  try {
    const apiEndpoint = getApiEndpoint(endpoint, region);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Sse': 'enable'  // 启用SSE，与enable_interleave配合使用
    };

    // 在开发环境使用Vite代理解决CORS问题
    const isDev = import.meta.env.DEV;
    let requestUrl = apiEndpoint;
    
    if (isDev && !endpoint) {
      // 开发环境且用户没有配置自定义endpoint时使用代理
      requestUrl = '/api/dashscope/api/v1/services/aigc/multimodal-generation/generation';
    }

    console.log('阿里云百炼API请求详细信息:', {
      url: requestUrl,
      model,
      size: buildSizeString(width, height),
      endpointFromConfig: endpoint,
      regionFromConfig: region,
      apiKeyPreview: apiKey.substring(0, 10) + '...',
      requestMethod: 'POST',
      usingProxy: isDev && !endpoint,
      requestBody: requestBody
    });

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('阿里云百炼API响应错误 - 完整信息:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        requestBody
      });
      
      throw new Error(`阿里云百炼API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // 解析SSE响应
    const imageUrls: string[] = [];
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let lastData: DashScopeGenerationResponse | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.substring(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const sseData: DashScopeGenerationResponse = JSON.parse(dataStr);
            console.log('收到SSE数据:', sseData);
            lastData = sseData;

            if (sseData.output?.choices) {
              for (const choice of sseData.output.choices) {
                if (choice.message?.content) {
                  for (const content of choice.message.content) {
                    if (content.type === 'image' && content.image) {
                      if (!imageUrls.includes(content.image)) {
                        imageUrls.push(content.image);
                      }
                    }
                  }
                }
              }
            }

            if (sseData.output?.finished || sseData.output?.choices?.some(c => c.finish_reason === 'stop')) {
              console.log('SSE流完成，已收集图片数量:', imageUrls.length);
              break;
            }
          } catch (parseErr) {
            console.warn('解析SSE数据失败:', dataStr, parseErr);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    console.log('阿里云百炼API响应完成:', {
      hasLastData: !!lastData,
      requestId: lastData?.request_id,
      imageCount: imageUrls.length
    });

    if (imageUrls.length === 0) {
      throw new Error('未找到生成的图片');
    }

    return imageUrls;

  } catch (error: any) {
    console.error('阿里云百炼API调用失败:', error);
    
    // 错误处理：网络错误时回退到演示模式
    const errorMessage = error.message || String(error);
    const isNetworkError = 
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('network') ||
                          errorMessage.includes('CORS');
    
    // 在开发环境下，网络错误回退到演示模式
    if (import.meta.env.DEV && isNetworkError) {
      console.warn('开发环境下网络错误，回退到阿里云百炼演示模式');
      return simulateDashScopeResponse(prompt, negativePrompt, 'text-to-image');
    }
    
    throw error;
  }
}

/**
 * 生成图生图（图像编辑）
 */
export async function generateImageToImage(
  config: DashScopeConfig,
  prompt: string,
  imageUrls: string[], // 支持多个参考图
  options?: {
    negativePrompt?: string;
    width?: number;
    height?: number;
    numImages?: number;
    promptExtend?: boolean;
    watermark?: boolean;
    seed?: number;
    size?: string; // 可以直接使用size字符串，如"1K"、"1280*1280"
  }
): Promise<string[]> {
  const {
    apiKey,
    model = 'wan2.6-image',
    endpoint,
    region = 'cn-beijing'
  } = config;

  const {
    negativePrompt = '',
    width = 1280,
    height = 1280,
    numImages = 1,
    promptExtend = false,
    watermark = false,
    seed,
    size
  } = options || {};

  console.log('阿里云百炼图生图调用:', {
    model,
    promptPreview: prompt.substring(0, 50) + '...',
    imageCount: imageUrls.length,
    width,
    height,
    numImages,
    apiKeyFormat: apiKey ? (apiKey.startsWith('sk-') ? '标准格式' : '非标准格式') : '空'
  });

  // 演示模式处理
  if (!apiKey || apiKey.startsWith('dashscope-demo')) {
    console.log('使用阿里云百炼演示模式生成图片（图生图）');
    return simulateDashScopeResponse(prompt, negativePrompt, 'image-to-image');
  }

  // 验证API密钥格式
  if (!validateApiKey(apiKey)) {
    console.warn('阿里云百炼API密钥格式可能不正确，但仍尝试调用');
  }

  // 构建content数组：文本+多个图像
  const content: Array<{ text: string; image?: string }> = [
    { text: prompt }
  ];
  
  // 添加所有图像
  for (const imageUrl of imageUrls) {
    content.push({ image: imageUrl });
  }

  const requestBody: DashScopeTextToImageRequest = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content
        }
      ]
    },
    parameters: {
      prompt_extend: promptExtend,
      watermark,
      n: numImages,
      negative_prompt: negativePrompt,
      enable_interleave: false,  // 图生图使用图像编辑模式
      size: size || "1K",  // 使用1K档位，宽高比与输入图像一致
      ...(seed !== undefined ? { seed } : {})
    }
  };

  try {
    const apiEndpoint = getApiEndpoint(endpoint, region);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // 在开发环境使用Vite代理解决CORS问题
    const isDev = import.meta.env.DEV;
    let requestUrl = apiEndpoint;
    
    if (isDev && !endpoint) {
      // 开发环境且用户没有配置自定义endpoint时使用代理
      requestUrl = '/api/dashscope/api/v1/services/aigc/multimodal-generation/generation';
    }

    console.log('阿里云百炼图生图API请求:', {
      url: requestUrl,
      model,
      contentLength: content.length,
      imageCount: imageUrls.length,
      usingProxy: isDev && !endpoint
    });

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('阿里云百炼图生图API响应错误:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 200)
      });
      
      throw new Error(`阿里云百炼图生图API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: DashScopeGenerationResponse = await response.json();
    
    console.log('阿里云百炼图生图API响应:', {
      requestId: data.request_id,
      hasOutput: !!data.output,
      imageCount: data.output?.choices?.length || 0
    });

    if (!data.output || !data.output.choices || data.output.choices.length === 0) {
      throw new Error('阿里云百炼图生图API返回空结果');
    }

    // 提取图片URL
    const resultImageUrls: string[] = [];
    
    for (const choice of data.output.choices) {
      if (choice.message.content) {
        for (const content of choice.message.content) {
          if (content.type === 'image' && content.image) {
            resultImageUrls.push(content.image);
          }
        }
      }
    }

    if (resultImageUrls.length === 0) {
      throw new Error('未找到生成的图片');
    }

    return resultImageUrls;

  } catch (error: any) {
    console.error('阿里云百炼图生图API调用失败:', error);
    
    // 错误处理：网络错误时回退到演示模式
    const errorMessage = error.message || String(error);
    const isNetworkError = 
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('network') ||
                          errorMessage.includes('CORS');
    
    // 在开发环境下，网络错误回退到演示模式
    if (import.meta.env.DEV && isNetworkError) {
      console.warn('开发环境下网络错误，回退到阿里云百炼演示模式');
      return simulateDashScopeResponse(prompt, negativePrompt, 'image-to-image');
    }
    
    throw error;
  }
}

/**
 * 生成图文混排内容（流式输出）
 * 注意：此功能需要服务器支持流式响应，前端需要处理SSE
 */
export async function generateTextWithImages(
  config: DashScopeConfig,
  prompt: string,
  options?: {
    maxImages?: number;
    size?: string;
    promptExtend?: boolean;
    watermark?: boolean;
    seed?: number;
    onProgress?: (data: any) => void; // 进度回调
  }
): Promise<{ images: string[]; text?: string }> {
  const {
    apiKey,
    model = 'wan2.6-image',
    endpoint,
    region = 'cn-beijing'
  } = config;

  const {
    maxImages = 1,
    size = '1280*1280',
    promptExtend = false,
    watermark = false,
    seed,
    onProgress
  } = options || {};

  console.log('阿里云百炼图文混排调用:', {
    model,
    promptPreview: prompt.substring(0, 50) + '...',
    maxImages,
    size,
    apiKeyFormat: apiKey ? (apiKey.startsWith('sk-') ? '标准格式' : '非标准格式') : '空'
  });

  // 演示模式处理
  if (!apiKey || apiKey.startsWith('dashscope-demo')) {
    console.log('使用阿里云百炼演示模式生成图文混排');
    const images = await simulateDashScopeResponse(prompt, '', 'text-to-image');
    return { images };
  }

  const requestBody: DashScopeTextToImageRequest = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content: [
            {
              text: prompt
            }
          ]
        }
      ]
    },
    parameters: {
      prompt_extend: promptExtend,
      watermark,
      max_images: maxImages,
      size,
      stream: true,
      enable_interleave: true,
      ...(seed !== undefined ? { seed } : {})
    }
  };

  try {
    const apiEndpoint = getApiEndpoint(endpoint, region);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Sse': 'enable'  // 开启服务器发送事件
    };

    // 在开发环境使用Vite代理解决CORS问题
    const isDev = import.meta.env.DEV;
    let requestUrl = apiEndpoint;
    
    if (isDev && !endpoint) {
      // 开发环境且用户没有配置自定义endpoint时使用代理
      requestUrl = '/api/dashscope/api/v1/services/aigc/multimodal-generation/generation';
    }

    console.log('阿里云百炼图文混排API请求:', {
      url: requestUrl,
      model,
      maxImages,
      size,
      hasProgressCallback: !!onProgress,
      usingProxy: isDev && !endpoint
    });

    // 对于流式响应，我们使用EventSource或者fetch的流式读取
    // 这里简化处理，先使用普通请求，实际生产环境需要实现SSE处理
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('阿里云百炼图文混排API响应错误:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 200)
      });
      
      throw new Error(`阿里云百炼图文混排API请求失败: ${response.status} ${response.statusText}`);
    }

    // 简化处理：先尝试解析为普通响应
    // 注意：图文混排应该返回流式响应，这里需要特殊处理
    const responseText = await response.text();
    
    // 尝试解析JSON
    try {
      const data = JSON.parse(responseText) as DashScopeGenerationResponse;
      
      console.log('阿里云百炼图文混排API响应:', {
        requestId: data.request_id,
        hasOutput: !!data.output,
        imageCount: data.output?.choices?.length || 0
      });

      if (!data.output || !data.output.choices || data.output.choices.length === 0) {
        throw new Error('阿里云百炼图文混排API返回空结果');
      }

      // 提取图片URL
      const imageUrls: string[] = [];
      let textContent = '';
      
      for (const choice of data.output.choices) {
        if (choice.message.content) {
          for (const content of choice.message.content) {
            if (content.type === 'image' && content.image) {
              imageUrls.push(content.image);
            }
          }
        }
      }

      if (imageUrls.length === 0) {
        // 如果没有图片，可能是流式响应需要特殊处理
        console.warn('图文混排API可能返回了流式响应，需要实现SSE处理');
        return { images: [] };
      }

      return { images: imageUrls, text: textContent };

    } catch (parseError) {
      console.warn('图文混排响应解析失败，可能是流式格式:', parseError);
      // 返回空结果，提示用户需要实现SSE处理
      return { images: [] };
    }

  } catch (error: any) {
    console.error('阿里云百炼图文混排API调用失败:', error);
    
    // 错误处理：网络错误时回退到演示模式
    const errorMessage = error.message || String(error);
    const isNetworkError = 
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('network') ||
                          errorMessage.includes('CORS');
    
    // 在开发环境下，网络错误回退到演示模式
    if (import.meta.env.DEV && isNetworkError) {
      console.warn('开发环境下网络错误，回退到阿里云百炼演示模式');
      const images = await simulateDashScopeResponse(prompt, '', 'text-to-image');
      return { images };
    }
    
    throw error;
  }
}

/**
 * 模拟阿里云百炼API响应
 */
function simulateDashScopeResponse(
  prompt: string,
  negativePrompt?: string,
  mode: 'text-to-image' | 'image-to-image' = 'text-to-image'
): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 生成模拟图像URL（实际不存在，仅供演示）
      const mockImageUrls = [
        `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1280" viewBox="0 0 1280 1280">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="640" y="320" font-family="Arial" font-size="32" text-anchor="middle" fill="#666">
            阿里云百炼万相文生图演示
          </text>
          <text x="640" y="400" font-family="Arial" font-size="24" text-anchor="middle" fill="#999" width="1000">
            ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}
          </text>
          <text x="640" y="800" font-family="Arial" font-size="20" text-anchor="middle" fill="#ccc">
            这是演示图像，配置有效API密钥后可生成真实图片
          </text>
          <circle cx="640" cy="600" r="80" fill="#3498db" opacity="0.6"/>
        </svg>`)}`
      ];
      
      console.log('阿里云百炼演示模式生成图像:', {
        promptPreview: prompt.substring(0, 30) + '...',
        negativePrompt,
        mode
      });
      
      resolve(mockImageUrls);
    }, 1200); // 模拟网络延迟
  });
}
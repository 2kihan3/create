/**
 * OpenAI API 服务
 * 支持GPT模型文本生成
 */

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenAIGenerationRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIGenerationResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用OpenAI GPT生成文本
 */
export async function generateText(
  config: OpenAIConfig,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const { apiKey, model = 'gpt-4', temperature = 0.7, maxTokens = 1000 } = config;

  if (!apiKey || apiKey.startsWith('sk-demo')) {
    // 模拟API响应，用于演示
    console.log('使用OpenAI演示模式生成文案');
    return simulateOpenAIResponse(prompt, systemPrompt);
  }

  const messages = [];
  
  if (systemPrompt) {
    messages.push({
      role: 'system' as const,
      content: systemPrompt
    });
  }
  
  messages.push({
    role: 'user' as const,
    content: prompt
  });

  const requestBody: OpenAIGenerationRequest = {
    messages,
    model,
    temperature,
    max_tokens: maxTokens
  };

  try {
    // 使用代理端点避免CORS问题
    const endpoint = import.meta.env.VITE_OPENAI_PROXY_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    const proxyEnabled = import.meta.env.VITE_OPENAI_PROXY_ENDPOINT;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(proxyEnabled 
          ? { 'X-API-Key': apiKey }  // 使用代理时传递API密钥
          : { 'Authorization': `Bearer ${apiKey}` })  // 直接调用时使用标准头
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API错误: ${response.status} ${response.statusText} - ${errorData.error?.message || '未知错误'}`
      );
    }

    const data: OpenAIGenerationResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI返回了空结果');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API调用失败:', error);
    throw error;
  }
}

/**
 * 构建文案生成提示词
 */
export function buildCopywritingPrompt(
  productName: string,
  keywords: string,
  targetAudience: string,
  tone: string,
  length: 'short' | 'medium' | 'long',
  sceneType: 'we-media' | 'e-commerce',
  includePrice?: boolean,
  price?: string
): string {
  const sceneMap = {
    'we-media': '小红书/抖音/微博等自媒体平台',
    'e-commerce': '淘宝/京东/拼多多等电商平台'
  };

  const lengthMap = {
    'short': '简短精炼，100字以内',
    'medium': '适中详细，200-300字',
    'long': '详细全面，400-500字'
  };

  const toneMap: Record<string, string> = {
    '亲切分享': '亲切、真实、像朋友分享一样',
    '专业评测': '专业、客观、有数据支持',
    '热情推荐': '热情、有感染力、让人想立即购买',
    '简洁说明': '简洁明了、重点突出、无多余描述'
  };

  const toneDescription = toneMap[tone] || tone;

  let prompt = `请为${sceneMap[sceneType]}生成一段${lengthMap[length]}的文案。

产品/主题：${productName}
关键词：${keywords}
目标受众：${targetAudience}
文案风格：${toneDescription}

要求：`;

  if (sceneType === 'we-media') {
    prompt += `
1. 符合${sceneMap[sceneType]}平台风格
2. 使用表情符号和分段增加可读性
3. 突出${keywords}的特点
4. 吸引${targetAudience}的注意力
5. 结尾添加相关话题标签`;
  } else {
    prompt += `
1. 突出产品卖点：${keywords}
2. 针对${targetAudience}的需求
3. 包含购买引导
4. 结构清晰：标题+卖点+使用场景+购买理由`;
    
    if (includePrice && price) {
      prompt += `
5. 价格信息：${price}元（请自然融入文中）`;
    }
  }

  return prompt;
}

/**
 * 生成多版本文案
 */
export async function generateMultipleTexts(
  config: OpenAIConfig,
  basePrompt: string,
  count: number = 3
): Promise<string[]> {
  const results: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      // 为每个版本添加轻微变化
      const variantPrompt = `${basePrompt}\n\n请生成第${i + 1}个版本，在保持核心信息不变的情况下，尝试不同的表达方式和结构。`;
      const text = await generateText(config, variantPrompt);
      results.push(text);
    } catch (error) {
      console.error(`生成第${i + 1}版本文案失败:`, error);
      // 如果失败，添加占位符
      results.push(`生成失败，请重试。错误: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * 模拟OpenAI API响应
 */
function simulateOpenAIResponse(prompt: string, systemPrompt?: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 分析prompt内容，生成模拟响应
      let response = '';
      
      if (prompt.includes('小红书') || prompt.includes('自媒体')) {
        response = `✨ 春季针织衫穿搭分享 ✨\n\n最近入手的这件春季针织衫真的太爱了！\n\n✅ 材质：柔软舒适，透气性好\n✅ 设计：简约百搭，不挑身材\n✅ 颜色：温柔系奶茶色，显白又高级\n\n穿搭建议：可以搭配高腰牛仔裤或半身裙，上班约会都适合！\n\n真实体验：穿上身真的很舒服，弹性也很好，活动自如～\n\n#春季穿搭 #针织衫推荐 #ootd #每日穿搭 #好物推荐`;
      } else if (prompt.includes('电商') || prompt.includes('淘宝') || prompt.includes('商品')) {
        response = `🚀 智能手表热销中！多功能健康监测\n\n📊 核心功能亮点：\n• 24小时心率监测，守护健康\n• 血氧饱和度检测，随时掌握身体状况\n• 深度睡眠分析，改善睡眠质量\n• 50+运动模式，专业数据记录\n• 14天超长续航，告别频繁充电\n\n🎯 目标用户：健身爱好者、上班族、健康关注人群\n\n💳 价格：限时优惠价299元（原价499元）\n\n🔒 品质保障：一年质保，30天无忧退换\n\n👉 立即下单，享受智能健康生活！`;
      } else {
        response = `基于您的输入，我生成了以下内容：\n\n${prompt.substring(0, 150)}...\n\n（这是OpenAI演示模式生成的模拟文案。如需真实API生成，请在API密钥管理页面配置有效的OpenAI API密钥。）`;
      }
      
      resolve(response);
    }, 800); // 模拟网络延迟
  });
}
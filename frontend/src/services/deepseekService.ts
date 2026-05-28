/**
 * DeepSeek API 服务
 * 兼容OpenAI API格式
 */

export interface DeepSeekConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DeepSeekGenerationRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface DeepSeekGenerationResponse {
  id: string;
  object: string;
  created: number;
  model: string;
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
 * 调用DeepSeek生成文本
 */
export async function generateText(
  config: DeepSeekConfig,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const { apiKey, model = 'deepseek-reasoner', temperature = 0.7, maxTokens = 1000 } = config;

  if (!apiKey || apiKey.startsWith('sk-demo')) {
    // 模拟API响应，用于演示
    console.log('使用DeepSeek演示模式生成文案');
    return simulateDeepSeekResponse(prompt, systemPrompt);
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

  const requestBody: DeepSeekGenerationRequest = {
    messages,
    model,
    temperature,
    max_tokens: maxTokens,
    stream: false
  };

  try {
    // DeepSeek API端点
    const endpoint = import.meta.env.VITE_DEEPSEEK_PROXY_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';
    const proxyEnabled = import.meta.env.VITE_DEEPSEEK_PROXY_ENDPOINT;
    
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
        `DeepSeek API错误: ${response.status} ${response.statusText} - ${errorData.error?.message || '未知错误'}`
      );
    }

    const data: DeepSeekGenerationResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('DeepSeek返回了空结果');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
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
  config: DeepSeekConfig,
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
 * 获取支持的模型列表
 */
export function getSupportedModels(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: 'deepseek-chat', name: 'DeepSeek Chat', description: '最新对话模型' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', description: '代码生成专用' },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: '推理增强版本' }
  ];
}

/**
 * 验证DeepSeek API密钥格式
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) return false;
  // DeepSeek API密钥通常以"sk-"开头
  return apiKey.startsWith('sk-');
}

/**
 * 模拟DeepSeek API响应
 */
function simulateDeepSeekResponse(prompt: string, systemPrompt?: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 分析prompt内容，生成模拟响应
      let response = '';
      
      if (prompt.includes('小红书') || prompt.includes('自媒体')) {
        response = `🌟【春季穿搭分享】\n\n姐妹们！发现一款超美的春季针织衫，简直是我的本命单品！\n\n✨ 材质：柔软亲肤，透气性超好\n✨ 设计：简约大方，百搭各种下装\n✨ 颜色：温柔奶茶色，显白又高级\n\n试穿感受：上身超级舒适，不管是上班通勤还是周末出游都很合适～搭配牛仔裤或裙子都绝绝子！\n\n#春季穿搭 #针织衫 #ootd #每日穿搭 #好物分享`;
      } else if (prompt.includes('电商') || prompt.includes('淘宝') || prompt.includes('商品')) {
        response = `🔥【智能手表旗舰款】限时特惠！\n\n💎 核心功能：\n✓ 健康监测：心率、血氧、睡眠全方位跟踪\n✓ 运动模式：50+专业运动模式，精准记录\n✓ 超长续航：14天强劲续航，告别电量焦虑\n✓ 防水等级：5ATM游泳级防水，无惧汗水雨水\n\n🎯 适用人群：运动爱好者、职场人士、健康关注者\n\n💰 限时特价：仅需299元！原价499元\n\n📱 搭配专属APP，数据同步更便捷，让你的健康管理更科学！\n\n👉 点击立即购买，开启智能健康生活！`;
      } else {
        response = `基于您的要求，我已生成以下文案：\n\n${prompt.substring(0, 200)}...\n\n（这是DeepSeek演示模式生成的模拟文案。如需真实API生成，请在API密钥管理页面配置有效的DeepSeek API密钥。）`;
      }
      
      resolve(response);
    }, 800); // 模拟网络延迟
  });
}
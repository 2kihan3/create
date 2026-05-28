/**
 * AI服务统一出口
 */

export * from './openaiService';
export * from './sdService';
export * from './deepseekService';
export * from './jimengService';
export * from './dashscopeService';

/**
 * 通用AI服务接口
 */
export interface AIServiceConfig {
  provider: 'openai' | 'stablediffusion' | 'claude' | 'midjourney' | 'deepseek' | 'jimeng' | 'dashscope';
  apiKey: string;
  endpoint?: string;
}

/**
 * 获取默认配置
 */
export function getDefaultConfig(provider: string): Partial<AIServiceConfig> {
  const configs: Record<string, Partial<AIServiceConfig>> = {
    openai: {
      provider: 'openai',
      endpoint: 'https://api.openai.com/v1'
    },
    stablediffusion: {
      provider: 'stablediffusion',
      endpoint: 'https://api.stability.ai/v1'
    },
    claude: {
      provider: 'claude',
      endpoint: 'https://api.anthropic.com/v1'
    },
    deepseek: {
      provider: 'deepseek',
      endpoint: 'https://api.deepseek.com/v1'
    },
    jimeng: {
      provider: 'jimeng',
      endpoint: 'https://visual.volcengineapi.com'
    },
    dashscope: {
      provider: 'dashscope',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
    }
  };
  
  return configs[provider] || {};
}

/**
 * 验证API密钥格式
 */
export function validateApiKey(provider: string, apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) return false;
  
  const patterns: Record<string, RegExp> = {
    openai: /^sk-[a-zA-Z0-9]{48,}$/,
    stablediffusion: /^[a-zA-Z0-9]{40,}$/,
    claude: /^sk-ant-[a-zA-Z0-9]{48,}$/,
    deepseek: /^sk-[a-zA-Z0-9]{48,}$/,
    jimeng: /^(jm-|sk-)[a-zA-Z0-9]{40,}$/,
    dashscope: /^sk-[a-zA-Z0-9]{32,}$/
  };
  
  const pattern = patterns[provider];
  if (!pattern) return true; // 未知提供商不验证格式
  
  return pattern.test(apiKey);
}

/**
 * 处理API错误
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * 创建API调用函数
 */
export function createApiCaller(config: AIServiceConfig) {
  return {
    generateText: async (prompt: string, options?: any) => {
      // 根据提供商调用相应的服务
      // 这里可以扩展支持更多提供商
      throw new Error('尚未实现多提供商统一接口');
    },
    
    generateImage: async (prompt: string, options?: any) => {
      throw new Error('尚未实现多提供商统一接口');
    }
  };
}
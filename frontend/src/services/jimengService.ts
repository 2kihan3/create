/**
 * 即梦AI图片生成服务
 * 支持文生图和图生图功能
 */

export interface JimengConfig {
  apiKey: string;
  endpoint?: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
}

export interface JimengTextToImageRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  num_images?: number;
}

export interface JimengImageToImageRequest {
  prompt: string;
  image: string;
  strength?: number;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  num_images?: number;
}

export interface JimengGenerationResponse {
  success: boolean;
  data?: {
    images?: string[];
    url?: string;
  };
  message?: string;
  code?: number;
}

function parseJimengCredentials(apiKey: string): { keyId: string; secret: string } {
  if (apiKey.includes('|')) {
    const [keyId, secret] = apiKey.split('|', 2);
    return { keyId, secret };
  }
  return { keyId: '', secret: apiKey };
}

function isVolcanoEngineEndpoint(endpoint: string): boolean {
  return endpoint.includes('volcengineapi.com');
}

async function hmacSHA256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.sign('HMAC', key, encoder.encode(data));
}

async function hmacSHA256Hex(key: ArrayBuffer, data: string): Promise<string> {
  const signature = await hmacSHA256(key, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCanonicalQueryString(params: URLSearchParams): string {
  const sortedKeys = Array.from(params.keys()).sort();
  return sortedKeys
    .map(key => {
      const value = params.get(key) || '';
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

function getCanonicalHeaders(headers: Record<string, string>): { canonicalHeaders: string; signedHeaders: string } {
  const lowerCaseHeaders = Object.entries(headers).map(([key, value]) => [
    key.toLowerCase(),
    // 修剪并折叠多个空格
    value.trim().replace(/\s+/g, ' '),
  ]);
  const sortedHeaders = lowerCaseHeaders.sort(([a], [b]) => a.localeCompare(b));
  
  const canonicalHeaders = sortedHeaders
    .map(([key, value]) => `${key}:${value}\n`)
    .join('');
  const signedHeaders = sortedHeaders
    .map(([key]) => key)
    .join(';');
  
  return { canonicalHeaders, signedHeaders };
}

async function createVolcanoSignature(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string,
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string
): Promise<{ Authorization: string; 'X-Date': string; 'X-Content-Sha256': string }> {
  const encoder = new TextEncoder();
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  
  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname || '/';
  const canonicalQueryString = getCanonicalQueryString(urlObj.searchParams);
  
  const payloadHash = await sha256Hex(body);
  
  const allHeaders = {
    ...headers,
    'host': urlObj.host,
    'x-date': amzDate,
    'x-content-sha256': payloadHash,
  };
  
  const { canonicalHeaders, signedHeaders } = getCanonicalHeaders(allHeaders);
  
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = 'HMAC-SHA256';  // 火山引擎文档中常用HMAC-SHA256
  const credentialScope = `${dateStamp}/${region}/${service}/request`;
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // 调试日志 - 火山引擎签名计算
  console.log('[火山引擎签名调试 - 详细]', {
    dateStamp,
    amzDate,
    credentialScope,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders: canonicalHeaders,
    signedHeaders,
    payloadHash,
    canonicalRequest,
    hashedCanonicalRequest,
    stringToSign,
    // 调试密钥信息
    accessKeyIdLength: accessKeyId.length,
    secretAccessKeyLength: secretAccessKey.length,
    secretAccessKeyPreview: secretAccessKey.substring(0, 10) + '...',
    secretIsBase64: /^[A-Za-z0-9+/=]+$/.test(secretAccessKey)
  });
  
  // 尝试解码secretAccessKey（可能是Base64编码）
  let secretKeyBytes: Uint8Array;
  try {
    if (/^[A-Za-z0-9+/=]+$/.test(secretAccessKey)) {
      // 看起来像Base64，尝试解码
      const binaryString = atob(secretAccessKey);
      secretKeyBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        secretKeyBytes[i] = binaryString.charCodeAt(i);
      }
      console.log('[火山引擎签名] Secret Access Key是Base64编码，解码后长度:', secretKeyBytes.length);
    } else {
      // 不是Base64，直接使用字符串
      secretKeyBytes = encoder.encode(secretAccessKey);
      console.log('[火山引擎签名] Secret Access Key是原始字符串，长度:', secretKeyBytes.length);
    }
  } catch (error) {
    console.log('[火山引擎签名] Base64解码失败，使用原始字符串:', error);
    secretKeyBytes = encoder.encode(secretAccessKey);
  }

  // 火山引擎签名密钥派生：可能不需要'VOLC'前缀
  const kDate = await crypto.subtle.importKey(
    'raw',
    secretKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const kRegionBuffer = await hmacSHA256(kDate, dateStamp);
  const kRegion = await crypto.subtle.importKey(
    'raw',
    kRegionBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  // 火山引擎签名密钥派生链
  console.log('[火山引擎签名] 密钥派生步骤:', { dateStamp, region, service });
  
  const kServiceBuffer = await hmacSHA256(kRegion, region);
  const kService = await crypto.subtle.importKey(
    'raw',
    kServiceBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // 尝试两种可能的最终派生字符串
  let kSigningBuffer, kSigning;
  const finalDerivationString = service;  // 可能是service而不是'request'
  
  console.log('[火山引擎签名] 最终派生字符串:', finalDerivationString);
  kSigningBuffer = await hmacSHA256(kService, finalDerivationString);
  kSigning = await crypto.subtle.importKey(
    'raw',
    kSigningBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await hmacSHA256Hex(kSigning, stringToSign);
  
  console.log('[火山引擎签名] 签名结果:', {
    signatureLength: signature.length,
    signaturePreview: signature.substring(0, 32) + '...'
  });
  
  const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    Authorization: authorization,
    'X-Date': amzDate,
    'X-Content-Sha256': payloadHash,
  };
}

function buildVolcanoEngineUrl(baseEndpoint: string, action: string): string {
  if (baseEndpoint.startsWith('http://') || baseEndpoint.startsWith('https://')) {
    const url = new URL(baseEndpoint);
    url.searchParams.append('Action', action);
    url.searchParams.append('Version', '2022-08-31');
    return url.toString();
  } else {
    return `${baseEndpoint}?Action=${encodeURIComponent(action)}&Version=${encodeURIComponent('2022-08-31')}`;
  }
}

function toVolcanoText2ImageRequest(
  prompt: string, 
  negativePrompt: string = '',
  width: number = 1024,
  height: number = 1024,
  steps: number = 30,
  guidanceScale: number = 7.5
): any {
  return {
    prompt: prompt,
    negative_prompt: negativePrompt,
    width: width,
    height: height,
    steps: steps,
    cfg_scale: guidanceScale,
    batch_size: 1,
    sampler: 'Euler',
    style: 'realistic'
  };
}

function toVolcanoImage2ImageRequest(
  prompt: string,
  image: string,
  strength: number = 0.75,
  negativePrompt: string = '',
  width: number = 1024,
  height: number = 1024,
  steps: number = 30,
  guidanceScale: number = 7.5
): any {
  return {
    prompt: prompt,
    image: image.replace(/^data:image\/[a-zA-Z]+;base64,/, ''),
    strength: strength,
    negative_prompt: negativePrompt,
    width: width,
    height: height,
    steps: steps,
    cfg_scale: guidanceScale,
    batch_size: 1,
    sampler: 'Euler',
    style: 'realistic'
  };
}

export async function generateTextToImage(
  config: JimengConfig,
  prompt: string,
  negativePrompt?: string
): Promise<string[]> {
  const {
    apiKey,
    endpoint = 'https://visual.volcengineapi.com',
    model = 'jimeng-v4.6',
    width = 1024,
    height = 1024,
    steps = 30,
    guidanceScale = 7.5
  } = config;

  console.log('即梦AI文生图调用调试:', { 
    apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'empty', 
    isDemoKey: apiKey?.startsWith('jm-demo'),
    endpoint,
    prompt: prompt.substring(0, 30) + '...',
    apiKeyLength: apiKey?.length,
    apiKeyFormat: apiKey?.includes('|') ? 'keyId|secret' : 'single-token'
  });

  if (!apiKey || apiKey.startsWith('jm-demo')) {
    console.log('使用即梦AI演示模式生成图片');
    return simulateJimengResponse(prompt, negativePrompt, 'text-to-image');
  }

  const requestBody: JimengTextToImageRequest = {
    prompt,
    negative_prompt: negativePrompt,
    width,
    height,
    num_inference_steps: steps,
    guidance_scale: guidanceScale,
    num_images: 1
  };

  try {
    const credentials = parseJimengCredentials(apiKey);
    
    let apiEndpoint = endpoint;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const isLocalhost = endpoint.includes('localhost') || endpoint.includes('127.0.0.1');
    const shouldUseProxy = isLocalhost || import.meta.env.DEV;
    
    const isVolcanoEngine = isVolcanoEngineEndpoint(endpoint);
    let requestUrl = `${apiEndpoint}/generate/text-to-image`;
    let requestBodyToSend = requestBody;
    
    if (isVolcanoEngine) {
      requestUrl = buildVolcanoEngineUrl(apiEndpoint, 'CVSync2AsyncSubmitTask');
      requestBodyToSend = toVolcanoText2ImageRequest(
        prompt,
        negativePrompt,
        width,
        height,
        steps,
        guidanceScale
      );
    }
    
    const bodyString = JSON.stringify(requestBodyToSend);
    
    // 生成签名头（如果是火山引擎API）
    if (isVolcanoEngine && credentials.keyId && credentials.secret) {
      const signatureHeaders = await createVolcanoSignature(
        credentials.keyId,
        credentials.secret,
        'cn-north-1',
        'cv',
        'POST',
        requestUrl,
        headers,
        bodyString
      );
      headers = { ...headers, ...signatureHeaders };
    } else if (credentials.keyId && credentials.secret) {
      // Basic认证
      const authString = `${credentials.keyId}:${credentials.secret}`;
      headers['Authorization'] = `Basic ${btoa(authString)}`;
    } else if (credentials.secret) {
      // Bearer认证
      headers['Authorization'] = `Bearer ${credentials.secret}`;
    }

    // 代理配置（如果使用代理）
    if (shouldUseProxy) {
      apiEndpoint = '/api/jimeng';
      requestUrl = isVolcanoEngine 
        ? buildVolcanoEngineUrl(apiEndpoint, 'CVSync2AsyncSubmitTask')
        : `${apiEndpoint}/generate/text-to-image`;
      // 如果已经有Authorization头（来自签名），不要设置X-API-Key
      // 代理将转发现有的Authorization头
      if (!headers.Authorization) {
        headers['X-API-Key'] = apiKey;
      }
    }
    
    console.log('即梦AI请求详情:', {
      isVolcanoEngine,
      requestUrl,
      headers: { ...headers, Authorization: headers.Authorization ? '***' : undefined },
      requestBodyPreview: bodyString.substring(0, 100) + '...'
    });
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: bodyString
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`即梦AI API错误: ${response.status} - ${errorText}`);
    }

    const result: JimengGenerationResponse = await response.json();
    
    if (!result.success) {
      throw new Error(`即梦AI生成失败: ${result.message || '未知错误'}`);
    }

    if (result.data?.images && result.data.images.length > 0) {
      return result.data.images;
    } else if (result.data?.url) {
      const imageUrl = result.data.url;
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const base64 = await blobToBase64(blob);
      return [base64];
    } else {
      throw new Error('即梦AI未返回图像数据');
    }
  } catch (error) {
    console.error('即梦AI API调用失败:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = errorMessage.includes('502') || 
                          errorMessage.includes('Failed to fetch') ||
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('network');
    
    if (import.meta.env.DEV && isNetworkError) {
      console.warn('开发环境下网络错误，回退到即梦AI演示模式');
      return simulateJimengResponse(prompt, negativePrompt, 'text-to-image');
    }
    
    throw error;
  }
}

export async function generateImageToImage(
  config: JimengConfig,
  prompt: string,
  image: string,
  negativePrompt?: string,
  strength: number = 0.7
): Promise<string[]> {
  const {
    apiKey,
    endpoint = 'https://visual.volcengineapi.com',
    model = 'jimeng-v4.6',
    width = 1024,
    height = 1024,
    steps = 30,
    guidanceScale = 7.5
  } = config;

  console.log('即梦AI图生图调用调试:', { 
    apiKey: apiKey ? '***' + apiKey.slice(-4) : 'empty', 
    isDemoKey: apiKey?.startsWith('jm-demo'),
    endpoint,
    prompt: prompt.substring(0, 30) + '...'
  });

  if (!apiKey || apiKey.startsWith('jm-demo')) {
    console.log('使用即梦AI演示模式生成图片（图生图）');
    return simulateJimengResponse(prompt, negativePrompt, 'image-to-image');
  }

  const requestBody: JimengImageToImageRequest = {
    prompt,
    image: image.replace(/^data:image\/\w+;base64,/, ''),
    strength,
    negative_prompt: negativePrompt,
    width,
    height,
    num_inference_steps: steps,
    guidance_scale: guidanceScale,
    num_images: 1
  };

  try {
    const credentials = parseJimengCredentials(apiKey);
    
    let apiEndpoint = endpoint;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const isLocalhost = endpoint.includes('localhost') || endpoint.includes('127.0.0.1');
    const shouldUseProxy = isLocalhost || import.meta.env.DEV;
    
    const isVolcanoEngine = isVolcanoEngineEndpoint(endpoint);
    let requestUrl = `${apiEndpoint}/generate/image-to-image`;
    let requestBodyToSend = requestBody;
    
    if (isVolcanoEngine) {
      requestUrl = buildVolcanoEngineUrl(apiEndpoint, 'CVSync2AsyncSubmitTask');
      requestBodyToSend = toVolcanoImage2ImageRequest(
        prompt,
        image,
        strength,
        negativePrompt,
        width,
        height,
        steps,
        guidanceScale
      );
    }
    
    const bodyString = JSON.stringify(requestBodyToSend);
    
    // 生成签名头（如果是火山引擎API）
    if (isVolcanoEngine && credentials.keyId && credentials.secret) {
      const signatureHeaders = await createVolcanoSignature(
        credentials.keyId,
        credentials.secret,
        'cn-north-1',
        'cv',
        'POST',
        requestUrl,
        headers,
        bodyString
      );
      headers = { ...headers, ...signatureHeaders };
    } else if (credentials.keyId && credentials.secret) {
      // Basic认证
      const authString = `${credentials.keyId}:${credentials.secret}`;
      headers['Authorization'] = `Basic ${btoa(authString)}`;
    } else if (credentials.secret) {
      // Bearer认证
      headers['Authorization'] = `Bearer ${credentials.secret}`;
    }

    // 代理配置（如果使用代理）
    if (shouldUseProxy) {
      apiEndpoint = '/api/jimeng';
      requestUrl = isVolcanoEngine 
        ? buildVolcanoEngineUrl(apiEndpoint, 'CVSync2AsyncSubmitTask')
        : `${apiEndpoint}/generate/image-to-image`;
      // 如果已经有Authorization头（来自签名），不要设置X-API-Key
      // 代理将转发现有的Authorization头
      if (!headers.Authorization) {
        headers['X-API-Key'] = apiKey;
      }
    }
    
    console.log('即梦AI请求详情:', {
      isVolcanoEngine,
      requestUrl,
      headers: { ...headers, Authorization: headers.Authorization ? '***' : undefined },
      requestBodyPreview: bodyString.substring(0, 100) + '...'
    });
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: bodyString
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`即梦AI API错误: ${response.status} - ${errorText}`);
    }

    const result: JimengGenerationResponse = await response.json();
    
    if (!result.success) {
      throw new Error(`即梦AI生成失败: ${result.message || '未知错误'}`);
    }

    if (result.data?.images && result.data.images.length > 0) {
      return result.data.images;
    } else if (result.data?.url) {
      const imageUrl = result.data.url;
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const base64 = await blobToBase64(blob);
      return [base64];
    } else {
      throw new Error('即梦AI未返回图像数据');
    }
  } catch (error) {
    console.error('即梦AI API调用失败:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = errorMessage.includes('502') || 
                          errorMessage.includes('Failed to fetch') ||
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('network');
    
    if (import.meta.env.DEV && isNetworkError) {
      console.warn('开发环境下网络错误，回退到即梦AI演示模式');
      return simulateJimengResponse(prompt, negativePrompt, 'image-to-image');
    }
    
    throw error;
  }
}

export function buildImagePrompt(
  productName: string,
  keywords: string,
  targetAudience: string,
  sceneType: 'we-media' | 'e-commerce',
  style: string = '高质量摄影'
): string {
  let basePrompt = '';
  
  if (sceneType === 'we-media') {
    basePrompt = `一张精美的${productName}图片，${keywords}，风格: ${style}，适合${targetAudience}，小红书风格，高颜值，吸引眼球，生活化场景，自然光线`;
  } else {
    basePrompt = `一张专业的${productName}商品展示图片，${keywords}，风格: ${style}，适合${targetAudience}，电商产品图，白色背景，清晰细节，商业摄影，打光专业`;
  }
  
  return basePrompt;
}

export function buildNegativePrompt(sceneType: 'we-media' | 'e-commerce'): string {
  const commonNegative = '低质量，模糊，失真，变形，丑陋，恐怖，水印，文字，logo，签名，多个主体，杂乱背景';
  
  if (sceneType === 'we-media') {
    return `${commonNegative}，过度商业感，僵硬摆拍`;
  } else {
    return `${commonNegative}，生活化过度，不专业`;
  }
}

function simulateJimengResponse(
  prompt: string,
  negativePrompt?: string,
  mode: 'text-to-image' | 'image-to-image' = 'text-to-image'
): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      console.log(`即梦AI演示模式 - ${mode} - 提示词: ${prompt.substring(0, 50)}...`);
      if (negativePrompt) {
        console.log(`负面提示词: ${negativePrompt.substring(0, 50)}...`);
      }
      
      resolve([mockBase64]);
    }, 1500);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function validateJimengApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) return false;
  if (apiKey.includes('|')) {
    const [keyId, secret] = apiKey.split('|', 2);
    return keyId.length > 0 && secret.length > 0;
  }
  return apiKey.startsWith('jm-') || apiKey.startsWith('sk-');
}

export function getSupportedModels(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: 'jimeng-v4.6', name: '即梦AI v4.6', description: '最新版本，画质最佳' },
    { id: 'jimeng-v4.0', name: '即梦AI v4.0', description: '稳定版本，速度快' },
    { id: 'jimeng-anime', name: '即梦动漫版', description: '动漫风格专用' },
    { id: 'jimeng-realistic', name: '即梦写实版', description: '写实风格专用' }
  ];
}

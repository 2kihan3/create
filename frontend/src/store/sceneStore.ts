import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 场景类型
export type SceneType = 'we-media' | 'e-commerce';

// 场景配置
export interface SceneConfig {
  id: SceneType;
  name: string;
  icon: string;
  description: string;
  defaultImageSize: { width: number; height: number };
  textStyle: string;
  templateCategories: string[];
}

// API密钥配置
export interface ApiKeyConfig {
  id: string;
  provider: string;
  name: string;
  apiKey: string;
  endpoint?: string;
  isActive: boolean;
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
}

// 用户偏好
export interface UserPreferences {
  defaultModel: {
    text: string;
    image: string;
  };
  autoSave: boolean;
  exportFormat: string;
  theme: 'light' | 'dark';
}

// 全局状态
interface SceneState {
  // 当前场景
  currentScene: SceneType;
  scenes: Record<SceneType, SceneConfig>;
  
  // API密钥管理
  apiKeys: ApiKeyConfig[];
  activeApiKeys: Record<string, string>; // provider -> apiKeyId
  
  // 用户偏好
  preferences: UserPreferences;
  
  // 最近项目
  recentProjects: Array<{
    id: string;
    name: string;
    scene: SceneType;
    lastModified: string;
  }>;
  
  // 操作
  switchScene: (scene: SceneType) => void;
  addApiKey: (key: ApiKeyConfig) => void;
  updateApiKey: (id: string, updates: Partial<ApiKeyConfig>) => void;
  deleteApiKey: (id: string) => void;
  setActiveApiKey: (provider: string, apiKeyId: string) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  addRecentProject: (project: Omit<SceneState['recentProjects'][0], 'id'>) => string;
}

// 默认场景配置
const defaultScenes: Record<SceneType, SceneConfig> = {
  'we-media': {
    id: 'we-media',
    name: '自媒体场景',
    icon: '📱',
    description: '适用于小红书、抖音、微博等社交平台的内容创作',
    defaultImageSize: { width: 1080, height: 1440 }, // 3:4 竖版
    textStyle: '亲切、分享、带Emoji',
    templateCategories: ['日常分享', '教程步骤', '好物推荐', '旅行打卡', '美食分享']
  },
  'e-commerce': {
    id: 'e-commerce',
    name: '电商场景',
    icon: '🛒',
    description: '适用于淘宝、京东、拼多多等电商平台的商品素材',
    defaultImageSize: { width: 800, height: 800 }, // 1:1 主图
    textStyle: '促销、卖点突出、含价格信息',
    templateCategories: ['商品主图', '详情页模板', '促销海报', '活动横幅']
  }
};

// 创建store
export const useSceneStore = create<SceneState>()(
  persist(
    (set, _get) => ({
      // 初始状态
      currentScene: 'we-media',
      scenes: defaultScenes,
      
      apiKeys: [
        {
          id: 'demo-deepseek',
          provider: 'deepseek',
          name: 'DeepSeek Demo Key',
          apiKey: 'sk-demo************',
          isActive: true,
          usageCount: 23,
          createdAt: '2026-04-14'
        },
        {
          id: 'demo-openai',
          provider: 'openai',
          name: 'OpenAI Demo Key',
          apiKey: 'sk-demo************',
          isActive: true,
          usageCount: 42,
          createdAt: '2026-04-01'
        },
        {
          id: 'demo-stablediffusion',
          provider: 'stablediffusion',
          name: 'Stable Diffusion API',
          apiKey: 'sd-demo************',
          endpoint: 'https://api.stability.ai/v1',
          isActive: true,
          usageCount: 18,
          createdAt: '2026-04-05'
        },
        {
          id: 'demo-jimeng',
          provider: 'jimeng',
          name: '即梦AI Demo Key',
          apiKey: 'jm-demo************',
          endpoint: 'https://visual.volcengineapi.com',
          isActive: true,
          usageCount: 12,
          createdAt: '2026-04-14'
        },
        {
          id: 'demo-dashscope',
          provider: 'dashscope',
          name: '阿里云百炼万相API',
          apiKey: 'dashscope-demo************',
          isActive: true,
          usageCount: 5,
          createdAt: '2026-04-15'
        }
      ],
      
      activeApiKeys: {
        'deepseek': 'demo-deepseek',
        'openai': 'demo-openai',
        'stablediffusion': 'demo-stablediffusion',
        'jimeng': 'demo-jimeng',
        'dashscope': 'demo-dashscope'
      },
      
      preferences: {
        defaultModel: {
          text: 'gpt-4',
          image: 'stable-diffusion'
        },
        autoSave: true,
        exportFormat: 'png',
        theme: 'light'
      },
      
      recentProjects: [
        {
          id: 'proj-1',
          name: '咖啡机推荐',
          scene: 'we-media',
          lastModified: '2026-04-13 14:30'
        },
        {
          id: 'proj-2',
          name: '春季穿搭分享',
          scene: 'we-media',
          lastModified: '2026-04-12 10:15'
        },
        {
          id: 'proj-3',
          name: '智能手表详情页',
          scene: 'e-commerce',
          lastModified: '2026-04-11 16:45'
        }
      ],
      
      // 切换场景
      switchScene: (scene) => {
        set({ currentScene: scene });
      },
      
      // 添加API密钥
      addApiKey: (key) => {
        set((state) => ({
          apiKeys: [...state.apiKeys, key]
        }));
      },
      
      // 更新API密钥
      updateApiKey: (id, updates) => {
        set((state) => ({
          apiKeys: state.apiKeys.map(key => 
            key.id === id ? { ...key, ...updates } : key
          )
        }));
      },
      
      // 删除API密钥
      deleteApiKey: (id) => {
        set((state) => ({
          apiKeys: state.apiKeys.filter(key => key.id !== id)
        }));
      },
      
      // 设置活跃API密钥
      setActiveApiKey: (provider, apiKeyId) => {
        set((state) => ({
          activeApiKeys: {
            ...state.activeApiKeys,
            [provider]: apiKeyId
          }
        }));
      },
      
      // 更新用户偏好
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates
          }
        }));
      },
      
      // 添加最近项目
      addRecentProject: (project) => {
        const id = `proj-${Date.now()}`;
        const newProject = { ...project, id };
        
        set((state) => ({
          recentProjects: [newProject, ...state.recentProjects.slice(0, 9)] // 保留最近10个
        }));
        
        return id;
      }
    }),
    {
      name: 'material-studio-scene-storage', // localStorage key
      partialize: (state) => ({
        currentScene: state.currentScene,
        apiKeys: state.apiKeys,
        activeApiKeys: state.activeApiKeys,
        preferences: state.preferences,
        recentProjects: state.recentProjects
      })
    }
  )
);

// 工具函数
export const getCurrentSceneConfig = (): SceneConfig => {
  const { currentScene, scenes } = useSceneStore.getState();
  return scenes[currentScene];
};

export const getActiveApiKey = (provider: string): ApiKeyConfig | undefined => {
  const { apiKeys, activeApiKeys } = useSceneStore.getState();
  const activeKeyId = activeApiKeys[provider];
  
  // 先尝试查找活跃密钥
  let activeKey = apiKeys.find(key => key.id === activeKeyId);
  
  // 如果没有找到活跃密钥，尝试使用该提供商的第一个有效密钥
  if (!activeKey) {
    const providerKeys = apiKeys.filter(key => key.provider === provider && key.isActive);
    if (providerKeys.length > 0) {
      activeKey = providerKeys[0];
      // 自动设置为活跃密钥
      useSceneStore.getState().setActiveApiKey(provider, activeKey.id);
      console.log(`自动设置 ${provider} 的第一个有效密钥为活跃密钥:`, activeKey.name);
    }
  }
  
  return activeKey;
};

export const getSceneColor = (scene: SceneType): string => {
  return scene === 'we-media' ? '#667eea' : '#764ba2';
};
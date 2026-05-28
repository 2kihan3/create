import React, { useState } from 'react';
import { 
  KeyOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckOutlined,
  CloseOutlined,
  HistoryOutlined,
  LockOutlined,
  GlobalOutlined,
  ApiOutlined,
  ToolOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSceneStore } from '../store/sceneStore';
import '../styles/global.css';

const ApiKeys: React.FC = () => {
  const { apiKeys, activeApiKeys, addApiKey, updateApiKey, deleteApiKey, setActiveApiKey } = useSceneStore();
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'openai',
    apiKey: '',
    apiKeyId: '', // 用于即梦AI的Key ID
    endpoint: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // API提供商配置
  const providers = [
    { id: 'deepseek', name: 'DeepSeek', icon: '🚀', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'openai', name: 'OpenAI GPT', icon: '🤖', color: 'bg-green-100 text-green-700' },
    { id: 'stablediffusion', name: 'Stable Diffusion', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
    { id: 'jimeng', name: '即梦AI', icon: '🌟', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'dashscope', name: '阿里云万相', icon: '☁️', color: 'bg-blue-100 text-blue-700' },
    { id: 'claude', name: 'Claude', icon: '🧠', color: 'bg-orange-100 text-orange-700' },
    { id: 'midjourney', name: 'Midjourney', icon: '✨', color: 'bg-pink-100 text-pink-700' },
    { id: 'gemini', name: 'Google Gemini', icon: '🔮', color: 'bg-blue-100 text-blue-700' },
    { id: 'custom', name: '自定义API', icon: '🔧', color: 'bg-gray-100 text-gray-700' },
  ];
  
  // 使用统计
  const usageStats = {
    totalCalls: 2431,
    tokensUsed: 1587432,
    imagesGenerated: 127,
    monthlyCost: 12.45,
  };
  
  const handleShowApiKey = (id: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    alert('API密钥已复制到剪贴板');
  };
  
  const handleAddApiKey = () => {
    // 验证
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入密钥名称';
    if (!formData.apiKey.trim()) newErrors.apiKey = '请输入API密钥';
    if (formData.provider === 'custom' && !formData.endpoint.trim()) {
      newErrors.endpoint = '请输入API端点';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 对于即梦AI，将Key ID和Secret组合存储
    const apiKeyValue = formData.provider === 'jimeng' && formData.apiKeyId
      ? `${formData.apiKeyId}|${formData.apiKey}` // Key ID和Secret用|分隔
      : formData.apiKey;
    
    const newKey = {
      id: `key-${Date.now()}`,
      provider: formData.provider,
      name: formData.name,
      apiKey: apiKeyValue,
      endpoint: formData.endpoint || undefined,
      isActive: true,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    addApiKey(newKey);
    setActiveApiKey(formData.provider, newKey.id);
    setFormData({ name: '', provider: 'openai', apiKeyId: '', apiKey: '', endpoint: '' });
    setIsAdding(false);
    setErrors({});
    alert('API密钥添加成功并已设为当前使用');
  };
  
  const handleEditApiKey = (key: any) => {
    setEditingId(key.id);
    
    // 对于即梦AI，需要从组合字符串中解析Key ID和Secret
    if (key.provider === 'jimeng' && key.apiKey.includes('|')) {
      const [apiKeyId, apiKey] = key.apiKey.split('|', 2);
      setFormData({
        name: key.name,
        provider: key.provider,
        apiKeyId,
        apiKey,
        endpoint: key.endpoint || '',
      });
    } else {
      setFormData({
        name: key.name,
        provider: key.provider,
        apiKeyId: '',
        apiKey: key.apiKey,
        endpoint: key.endpoint || '',
      });
    }
  };
  
  const handleUpdateApiKey = () => {
    if (!editingId) return;
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入密钥名称';
    
    // 对于即梦AI，需要验证Key ID和Secret
    if (formData.provider === 'jimeng') {
      if (!formData.apiKeyId.trim()) newErrors.apiKeyId = '请输入Key ID';
      if (!formData.apiKey.trim()) newErrors.apiKey = '请输入Secret';
    } else {
      if (!formData.apiKey.trim()) newErrors.apiKey = '请输入API密钥';
    }
    
    if (formData.provider === 'custom' && !formData.endpoint.trim()) {
      newErrors.endpoint = '请输入API端点';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 对于即梦AI，将Key ID和Secret组合存储
    const apiKeyValue = formData.provider === 'jimeng' && formData.apiKeyId
      ? `${formData.apiKeyId}|${formData.apiKey}` // Key ID和Secret用|分隔
      : formData.apiKey;
    
    updateApiKey(editingId, {
      name: formData.name,
      provider: formData.provider,
      apiKey: apiKeyValue,
      endpoint: formData.endpoint || undefined,
    });
    
    setFormData({ name: '', provider: 'openai', apiKeyId: '', apiKey: '', endpoint: '' });
    setEditingId(null);
    setErrors({});
    alert('API密钥更新成功');
  };
  
  const handleDeleteApiKey = (id: string, name: string) => {
    if (confirm(`确定要删除API密钥 "${name}" 吗？此操作不可撤销。`)) {
      deleteApiKey(id);
      alert('API密钥已删除');
    }
  };
  
  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateApiKey(id, { isActive: !currentActive });
  };
  
  const getProviderInfo = (providerId: string) => {
    return providers.find(p => p.id === providerId) || providers[providers.length - 1];
  };
  
  const formatApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center gradient-btn">
            <KeyOutlined className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API密钥管理</h1>
            <p className="text-gray-600">管理您的AI服务API密钥，安全调用外部AI服务</p>
          </div>
        </div>
        
        {/* 使用统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{usageStats.totalCalls}</div>
            <div className="text-sm text-gray-600">总调用次数</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{(usageStats.tokensUsed / 1000).toFixed(0)}K</div>
            <div className="text-sm text-gray-600">Token使用量</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{usageStats.imagesGenerated}</div>
            <div className="text-sm text-gray-600">图片生成数</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">${usageStats.monthlyCost}</div>
            <div className="text-sm text-gray-600">本月费用估算</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：添加/编辑表单 */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">
                {editingId ? '编辑API密钥' : isAdding ? '添加API密钥' : '添加新密钥'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {!isAdding && !editingId ? (
                <button
                  className="w-full gradient-btn py-3 flex items-center justify-center gap-2"
                  onClick={() => setIsAdding(true)}
                >
                  <PlusOutlined />
                  添加新API密钥
                </button>
              ) : (
                <>
                  {/* 密钥名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      密钥名称 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="例如：OpenAI生产环境密钥"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* API提供商 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API提供商 *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {providers.map(provider => (
                        <button
                          key={provider.id}
                          className={`p-2 border rounded-lg text-center transition-colors ${
                            formData.provider === provider.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setFormData({ ...formData, provider: provider.id })}
                        >
                          <div className="text-lg mb-1">{provider.icon}</div>
                          <div className="text-xs">{provider.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Key ID（仅即梦AI需要） */}
                  {formData.provider === 'jimeng' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key ID *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.apiKeyId}
                          onChange={(e) => setFormData({ ...formData, apiKeyId: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.apiKeyId ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="即梦AI Key ID"
                        />
                      </div>
                      {errors.apiKeyId && (
                        <p className="mt-1 text-sm text-red-600">{errors.apiKeyId}</p>
                      )}
                    </div>
                  )}
                  
                  {/* API密钥 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.provider === 'jimeng' ? 'Secret *' : 'API密钥 *'}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.apiKey ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={formData.provider === 'jimeng' ? '即梦AI Secret' : "sk-... 或 sd-... 等格式"}
                      />
                    </div>
                    {errors.apiKey && (
                      <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>
                    )}
                  </div>
                  
                  {/* API端点（自定义时显示） */}
                  {formData.provider === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API端点 *
                      </label>
                      <input
                        type="text"
                        value={formData.endpoint}
                        onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.endpoint ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://api.example.com/v1"
                      />
                      {errors.endpoint && (
                        <p className="mt-1 text-sm text-red-600">{errors.endpoint}</p>
                      )}
                    </div>
                  )}
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2 pt-2">
                    <button
                      className="flex-1 py-2 gradient-btn text-white rounded-lg"
                      onClick={editingId ? handleUpdateApiKey : handleAddApiKey}
                    >
                      {editingId ? '更新密钥' : '添加密钥'}
                    </button>
                    <button
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingId(null);
                        setFormData({ name: '', provider: 'openai', apiKeyId: '', apiKey: '', endpoint: '' });
                        setErrors({});
                      }}
                    >
                      取消
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* 安全提示 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <LockOutlined />
                安全提示
              </h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <ExclamationCircleOutlined className="text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">API密钥安全</h4>
                    <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                      <li>• 不要在公共代码库中提交API密钥</li>
                      <li>• 定期轮换密钥，建议每月更换</li>
                      <li>• 为不同环境使用不同密钥</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <ToolOutlined className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">最佳实践</h4>
                    <ul className="text-sm text-blue-800 mt-1 space-y-1">
                      <li>• 每个AI服务商使用独立的密钥</li>
                      <li>• 设置使用配额，防止超额费用</li>
                      <li>• 监控密钥使用情况，及时告警</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧：API密钥列表 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">我的API密钥</h2>
                <span className="text-sm text-gray-500">
                  {apiKeys.length} 个密钥
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {apiKeys.length > 0 ? (
                apiKeys.map(key => {
                  const providerInfo = getProviderInfo(key.provider);
                  const isActive = activeApiKeys[key.provider] === key.id;
                  const isEditing = editingId === key.id;
                  
                  return (
                    <div
                      key={key.id}
                      className={`border rounded-lg p-4 ${
                        isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      } ${isEditing ? 'border-purple-300 bg-purple-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${providerInfo.color}`}>
                            <span className="text-lg">{providerInfo.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{key.name}</h3>
                              {isActive && (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                  当前使用中
                                </span>
                              )}
                              {!key.isActive && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                  已禁用
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <span>{providerInfo.name}</span>
                              {key.endpoint && (
                                <>
                                  <span>•</span>
                                  <span className="text-xs truncate max-w-[200px]">{key.endpoint}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-gray-500 hover:text-blue-600"
                            onClick={() => handleToggleActive(key.id, key.isActive)}
                            title={key.isActive ? '禁用密钥' : '启用密钥'}
                          >
                            {key.isActive ? <CheckOutlined /> : <CloseOutlined />}
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-blue-600"
                            onClick={() => handleShowApiKey(key.id)}
                            title={showApiKey[key.id] ? '隐藏密钥' : '显示密钥'}
                          >
                            {showApiKey[key.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-green-600"
                            onClick={() => handleCopyApiKey(key.apiKey)}
                            title="复制密钥"
                          >
                            <CopyOutlined />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-purple-600"
                            onClick={() => handleEditApiKey(key)}
                            title="编辑"
                          >
                            <EditOutlined />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-red-600"
                            onClick={() => handleDeleteApiKey(key.id, key.name)}
                            title="删除"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </div>
                      
                      {/* API密钥显示 */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">API密钥：</span>
                          <span className="text-xs text-gray-500">
                            创建于 {key.createdAt} • 使用 {key.usageCount} 次
                            {key.lastUsed && ` • 最后使用 ${key.lastUsed}`}
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                          {showApiKey[key.id] ? key.apiKey : formatApiKey(key.apiKey)}
                        </div>
                      </div>
                      
                      {/* 状态和使用统计 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <HistoryOutlined />
                            <span>使用次数: {key.usageCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GlobalOutlined />
                            <span>服务商: {key.provider}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ApiOutlined />
                            <span>状态: {key.isActive ? '活跃' : '禁用'}</span>
                          </div>
                        </div>
                        
                        {key.isActive && !isActive && (
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            onClick={() => setActiveApiKey(key.provider, key.id)}
                          >
                            设为当前使用
                          </button>
                        )}
                        {isActive && (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">
                            ✓ 当前使用中
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <KeyOutlined className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无API密钥</h3>
                  <p className="text-gray-600 mb-4">
                    添加API密钥后，您可以开始使用AI服务生成文案和图片。
                  </p>
                  <button
                    className="gradient-btn px-6 py-2"
                    onClick={() => setIsAdding(true)}
                  >
                    添加第一个API密钥
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 使用说明 */}
          <div className="mt-6 card">
            <div className="card-header">
              <h2 className="card-title">如何使用API密钥</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">获取API密钥</h3>
                  <p className="text-sm text-gray-600">从AI服务商获取API密钥</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">添加到工作台</h3>
                  <p className="text-sm text-gray-600">在左侧表单添加并命名密钥</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">开始使用</h3>
                  <p className="text-sm text-gray-600">在文案/图片生成中选择密钥</p>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">💡 支持的服务商</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {providers.map(provider => (
                    <div
                      key={provider.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                    >
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-sm text-gray-700">{provider.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeys;
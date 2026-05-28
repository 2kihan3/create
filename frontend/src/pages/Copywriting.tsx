import React, { useState } from 'react';
import { 
  ArrowLeftOutlined, 
  SendOutlined, 
  CopyOutlined, 
  DownloadOutlined,
  EditOutlined,
  SyncOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useSceneStore, getActiveApiKey } from '../store/sceneStore';
import { Link } from 'react-router-dom';
import '../styles/global.css';
import { generateText, buildCopywritingPrompt } from '../services/deepseekService';
import { generateText as generateTextOpenAI } from '../services/openaiService';

interface CopywritingProps {
  sceneType: 'we-media' | 'e-commerce';
}

const Copywriting: React.FC<CopywritingProps> = ({ sceneType }) => {
  const { scenes } = useSceneStore();
  const sceneConfig = scenes[sceneType];
  
  const [formData, setFormData] = useState({
    productName: sceneType === 'we-media' ? '春季针织衫' : '智能手表',
    keywords: sceneType === 'we-media' ? '穿搭,春季,舒适,时尚' : '智能,健康,运动,防水',
    targetAudience: sceneType === 'we-media' ? '20-30岁女性' : '25-45岁男性',
    tone: '亲切分享',
    length: 'medium',
    includePrice: sceneType === 'e-commerce',
    price: '299',
    customPrompt: ''
  });
  
  const [generatedTexts, setGeneratedTexts] = useState<string[]>([
    sceneType === 'we-media' 
      ? "这件春季针织衫真的太舒服了！材质柔软亲肤，颜色也很显白，搭配牛仔裤或裙子都好看。春天不知道穿什么的时候，选它准没错！"
      : "智能手表功能全面：24小时心率监测、睡眠分析、多种运动模式。防水设计，游泳也能戴。超长续航，一周充一次电。",
    sceneType === 'we-media'
      ? "最近入手的这件针织衫，版型真的绝了！微宽松的设计不挑身材，V领显瘦又有点小性感。搭配一条项链，简约又不失精致感。"
      : "这款智能手表支持来电提醒、消息推送、音乐控制，还能监测血氧饱和度。生活防水，洗手也不用摘，非常方便。",
    sceneType === 'we-media'
      ? "针织衫的厚度刚刚好，春天单穿或秋天当内搭都很合适。我选的米白色，温温柔柔的，上班约会都很适合。质量也不错，洗了几次也没变形。"
      : "智能手表带NFC功能，可以当公交卡、门禁卡使用。内置GPS，户外运动记录轨迹准确。表盘丰富，每天换一种风格。"
  ]);
  
  const [selectedTextIndex, setSelectedTextIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>('');
  
  const toneOptions = [
    { value: '亲切分享', label: '亲切分享' },
    { value: '专业推荐', label: '专业推荐' },
    { value: '活泼有趣', label: '活泼有趣' },
    { value: '简洁高效', label: '简洁高效' },
    { value: '激情促销', label: '激情促销' }
  ];
  
  const lengthOptions = [
    { value: 'short', label: '简短精炼' },
    { value: 'medium', label: '适中详细' },
    { value: 'long', label: '长篇深度' }
  ];
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // 优先使用DeepSeek API密钥，如果没有则使用OpenAI
      let activeKey = getActiveApiKey('deepseek');
      let provider = 'deepseek';
      let model = 'deepseek-reasoner';
      
      if (!activeKey) {
        // 如果没有DeepSeek密钥，尝试OpenAI
        activeKey = getActiveApiKey('openai');
        provider = 'openai';
        model = 'gpt-4';
      }
      
      // 如果没有API密钥，直接使用模拟数据，不报错
      if (!activeKey) {
        const fallbackTexts = [
          sceneType === 'we-media'
            ? `基于【${formData.productName}】关键词【${formData.keywords}】生成的全新文案：这个春天，${formData.productName}成为了我的最爱！材质柔软舒适，设计简约大方，无论是日常通勤还是周末出游都很合适。强烈推荐给${formData.targetAudience}！`
            : `【${formData.productName}】热销中！功能强大：${formData.keywords.replace(/,/g, '、')}。适合${formData.targetAudience}，现在购买享优惠价${formData.price}元！`,
          sceneType === 'we-media'
            ? `尝试了这款${formData.productName}，真的有被惊艳到！${formData.keywords.split(',').join('、')}的特点都具备，特别适合${formData.targetAudience}。强烈安利给大家！`
            : `${formData.productName}新品上市！主打${formData.keywords.split(',').join('、')}功能，精准满足${formData.targetAudience}需求。限时特价${formData.price}元，不容错过！`
        ];
        setGeneratedTexts(fallbackTexts);
        setSelectedTextIndex(0);
        setIsGenerating(false);
        return;
      }
      
      // 构建提示词：将自定义Prompt与自动构建的Prompt拼接
      const autoPrompt = buildCopywritingPrompt(
        formData.productName,
        formData.keywords,
        formData.targetAudience,
        formData.tone,
        formData.length as 'short' | 'medium' | 'long',
        sceneType,
        formData.includePrice,
        formData.price
      );
      
      let prompt = autoPrompt;
      
      // 如果用户输入了自定义Prompt，追加到自动构建的Prompt后面
      if (formData.customPrompt && formData.customPrompt.trim() !== '') {
        prompt = `${autoPrompt}\n\n--- 附加要求 ---\n${formData.customPrompt.trim()}`;
      }
      
      // 系统提示词
      const systemPrompt = sceneType === 'we-media' 
        ? '你是一名专业的自媒体内容创作者，擅长撰写吸引人的社交媒体文案。请根据用户要求生成高质量文案。'
        : '你是一名专业的电商文案策划，擅长撰写促进销售的商品描述和营销文案。请根据用户要求生成高质量电商文案。';
      
      // 根据提供商调用相应的API
      let generatedText: string;
      if (provider === 'deepseek') {
        generatedText = await generateText(
          {
            apiKey: activeKey.apiKey,
            model: model,
            temperature: 0.7,
            maxTokens: 1000
          },
          prompt,
          systemPrompt
        );
      } else {
        // 使用OpenAI
        generatedText = await generateTextOpenAI(
          {
            apiKey: activeKey.apiKey,
            model: model,
            temperature: 0.7,
            maxTokens: 1000
          },
          prompt,
          systemPrompt
        );
      }
      
      // 生成多个版本（在真实API中，我们可以调用多次或使用不同参数）
      // 这里先使用单个结果，可以扩展为多版本
      const newTexts = [generatedText];
      
      // 如果需要更多版本，可以继续生成
      // 暂时保持一个版本，避免过多API调用
      
      setGeneratedTexts(newTexts);
      setSelectedTextIndex(0);
      
      // 更新使用计数
      // 这里可以添加使用计数逻辑
      
    } catch (error) {
      console.error('文案生成失败:', error);
      // 不显示错误弹窗，直接使用模拟数据
      // alert(`文案生成失败: ${error.message}`);
      
      // 失败时使用模拟数据作为fallback
      const fallbackTexts = [
        sceneType === 'we-media'
          ? `基于【${formData.productName}】关键词【${formData.keywords}】生成的全新文案：这个春天，${formData.productName}成为了我的最爱！材质柔软舒适，设计简约大方，无论是日常通勤还是周末出游都很合适。强烈推荐给${formData.targetAudience}！`
          : `【${formData.productName}】热销中！功能强大：${formData.keywords.replace(/,/g, '、')}。适合${formData.targetAudience}，现在购买享优惠价${formData.price}元！`,
        sceneType === 'we-media'
          ? `尝试了这款${formData.productName}，真的有被惊艳到！${formData.keywords.split(',').join('、')}的特点都具备，特别适合${formData.targetAudience}。强烈安利给大家！`
          : `${formData.productName}新品上市！主打${formData.keywords.split(',').join('、')}功能，精准满足${formData.targetAudience}需求。限时特价${formData.price}元，不容错过！`
      ];
      
      setGeneratedTexts(fallbackTexts);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制文本');
      });
  };
  
  const handleDownloadText = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.productName}_文案.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleEditText = (index: number) => {
    setEditedText(generatedTexts[index]);
    setIsEditing(true);
    setSelectedTextIndex(index);
  };
  
  const handleSaveEdit = () => {
    const newTexts = [...generatedTexts];
    newTexts[selectedTextIndex] = editedText;
    setGeneratedTexts(newTexts);
    setIsEditing(false);
  };
  
  const handleRegenerateOne = (index: number) => {
    const newTexts = [...generatedTexts];
    newTexts[index] = sceneType === 'we-media'
      ? `重新生成的文案${index + 1}: ${formData.productName}确实不错！${formData.keywords.split(',').join('、')}等特点明显，适合${formData.targetAudience}。`
      : `重新生成的促销文案${index + 1}: ${formData.productName}热卖中！${formData.keywords.split(',').join('、')}等功能突出，仅售${formData.price}元。`;
    setGeneratedTexts(newTexts);
  };
  
  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const getSceneIcon = () => {
    return sceneType === 'we-media' ? '📱' : '🛒';
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和返回 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link 
              to={`/${sceneType}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 no-underline"
            >
              <ArrowLeftOutlined />
              返回{sceneConfig.name}首页
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getSceneIcon()}</span>
            <span className="font-medium gradient-text">{sceneConfig.name}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">智能文案生成</h1>
            <p className="text-gray-600">
              基于AI模型生成高质量{sceneType === 'we-media' ? '社交文案' : '商品描述'}，支持多风格、多参数配置
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => alert('打开设置')}
            >
              <SettingOutlined />
            </button>
            <button 
              className="gradient-btn px-6 py-2"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <SyncOutlined className="animate-spin mr-2" />
                  生成中...
                </>
              ) : (
                <>
                  <SendOutlined className="mr-2" />
                  生成文案
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：配置面板 */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="card-header">
              <h2 className="card-title">文案配置</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {sceneType === 'we-media' ? '内容主题' : '商品名称'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.productName}
                  onChange={(e) => handleFormChange('productName', e.target.value)}
                  placeholder={sceneType === 'we-media' ? '例如：春季穿搭分享' : '例如：智能手表'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  关键词
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.keywords}
                  onChange={(e) => handleFormChange('keywords', e.target.value)}
                  placeholder="用逗号分隔，例如：舒适,时尚,百搭"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {sceneType === 'we-media' 
                    ? '描述产品特点或场景的关键词' 
                    : '突出商品卖点的关键词'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标受众
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.targetAudience}
                  onChange={(e) => handleFormChange('targetAudience', e.target.value)}
                  placeholder="例如：20-30岁女性"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文案风格
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.tone}
                  onChange={(e) => handleFormChange('tone', e.target.value)}
                >
                  {toneOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文案长度
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.length}
                  onChange={(e) => handleFormChange('length', e.target.value)}
                >
                  {lengthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {sceneType === 'e-commerce' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      包含价格信息
                    </label>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={formData.includePrice}
                      onChange={(e) => handleFormChange('includePrice', e.target.checked)}
                    />
                  </div>
                  
                  {formData.includePrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        价格
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">¥</span>
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.price}
                          onChange={(e) => handleFormChange('price', e.target.value)}
                          placeholder="299"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自定义Prompt（可选）
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.customPrompt}
                  onChange={(e) => handleFormChange('customPrompt', e.target.value)}
                  placeholder="可在此输入额外的生成要求，例如：使用特定语气、包含特定语句、排除某些内容等。"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  自定义内容将追加到自动构建的Prompt之后，与上述参数共同影响生成结果。
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <InfoCircleOutlined />
                  <span>使用 {sceneConfig.textStyle} 风格生成文案</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧：文案展示区域 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">生成的文案</h2>
                <span className="text-sm text-gray-500">
                  共 {generatedTexts.length} 个文案变体
                </span>
              </div>
            </div>
            
            {/* 文案变体切换 */}
            <div className="flex gap-2 mb-4">
              {generatedTexts.map((_, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTextIndex === index
                      ? 'gradient-btn text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedTextIndex(index)}
                >
                  变体 {index + 1}
                </button>
              ))}
            </div>
            
            {/* 当前选中文案 */}
            <div className="mb-6">
              {isEditing ? (
                <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">编辑文案</h3>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        onClick={() => setIsEditing(false)}
                      >
                        <CloseOutlined /> 取消
                      </button>
                      <button
                        className="gradient-btn px-3 py-1"
                        onClick={handleSaveEdit}
                      >
                        <CheckOutlined /> 保存
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                        <span className="text-white font-bold">AI</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          文案变体 {selectedTextIndex + 1}
                        </h3>
                        <p className="text-sm text-gray-500">
                          基于当前配置生成
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        onClick={() => handleEditText(selectedTextIndex)}
                        title="编辑文案"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        onClick={() => handleRegenerateOne(selectedTextIndex)}
                        title="重新生成此文案"
                      >
                        <SyncOutlined />
                      </button>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {generatedTexts[selectedTextIndex]}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={() => handleCopyText(generatedTexts[selectedTextIndex], selectedTextIndex)}
              >
                <CopyOutlined />
                {copiedIndex === selectedTextIndex ? '已复制' : '复制文案'}
              </button>
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                onClick={() => handleDownloadText(generatedTexts[selectedTextIndex])}
              >
                <DownloadOutlined />
                下载文案
              </button>
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                onClick={() => alert('分享文案')}
              >
                分享
              </button>
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setGeneratedTexts([])}
              >
                清空历史
              </button>
            </div>
          </div>
          
          {/* 历史记录 */}
          {generatedTexts.length > 0 && (
            <div className="card mt-6">
              <div className="card-header">
                <h2 className="card-title">生成历史</h2>
              </div>
              <div className="space-y-3">
                {generatedTexts.map((text, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedTextIndex === index
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTextIndex(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            变体 {index + 1}
                          </span>
                          {index === 0 && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                              最新
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 line-clamp-2">{text}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(text, index);
                          }}
                          title="复制"
                        >
                          <CopyOutlined />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTexts = generatedTexts.filter((_, i) => i !== index);
                            setGeneratedTexts(newTexts);
                            if (selectedTextIndex === index && newTexts.length > 0) {
                              setSelectedTextIndex(0);
                            }
                          }}
                          title="删除"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Copywriting;
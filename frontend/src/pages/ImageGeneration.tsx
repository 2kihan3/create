import React, { useState, useRef } from 'react';
import {
  ArrowLeftOutlined,
  PictureOutlined,
  DownloadOutlined,
  CopyOutlined,
  SyncOutlined,
  UploadOutlined,
  SwapOutlined,
  SlidersOutlined
} from '@ant-design/icons';
import { useSceneStore, getActiveApiKey } from '../store/sceneStore';
import { Link } from 'react-router-dom';
import '../styles/global.css';
import { generateImage as sdGenerateImage, buildImagePrompt as sdBuildImagePrompt, buildNegativePrompt as sdBuildNegativePrompt } from '../services/sdService';
import { generateTextToImage as jimengGenerateTextToImage, generateImageToImage as jimengGenerateImageToImage, buildImagePrompt as jimengBuildImagePrompt, buildNegativePrompt as jimengBuildNegativePrompt } from '../services/jimengService';
import { generateTextToImage as dashscopeGenerateTextToImage, generateImageToImage as dashscopeGenerateImageToImage } from '../services/dashscopeService';

interface ImageGenerationProps {
  sceneType: 'we-media' | 'e-commerce';
}

const ImageGeneration: React.FC<ImageGenerationProps> = ({ sceneType }) => {
  const { scenes } = useSceneStore();
  const sceneConfig = scenes[sceneType];

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'stablediffusion' | 'jimeng' | 'dashscope'>('stablediffusion');
  const [generationMode, setGenerationMode] = useState<'text-to-image' | 'image-to-image'>('text-to-image');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [strength, setStrength] = useState<number>(0.7);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const providers = [
    { id: 'stablediffusion', name: 'Stable Diffusion', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
    { id: 'jimeng', name: '即梦AI', icon: '🌟', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'dashscope', name: '阿里云万相', icon: '☁️', color: 'bg-blue-100 text-blue-700' },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    console.log('handleGenerate called', { selectedProvider, generationMode, prompt: prompt.substring(0, 30) });

    if (!prompt.trim()) {
      alert('请输入提示词');
      return;
    }

    if (generationMode === 'image-to-image' && !uploadedImage) {
      alert('请先上传一张图片');
      return;
    }

    setIsGenerating(true);

    try {
      let imageData: string[] = [];

      if (selectedProvider === 'stablediffusion') {
        const activeKey = getActiveApiKey('stablediffusion');
        if (!activeKey) {
          throw new Error('请先在API密钥管理页面配置Stable Diffusion API密钥');
        }

        const imagePrompt = sdBuildImagePrompt(
          '产品',
          prompt,
          sceneType === 'we-media' ? '社交媒体用户' : '电商购物者',
          sceneType,
          '高质量摄影'
        );

        const negativePrompt = sdBuildNegativePrompt(sceneType);

        if (generationMode === 'text-to-image') {
          const result = await sdGenerateImage(
            {
              apiKey: activeKey.apiKey,
              model: 'stable-diffusion-xl-1024-v1-0',
              width: 1024,
              height: 1024,
              steps: 30,
              cfgScale: 7
            },
            imagePrompt,
            negativePrompt
          );
          imageData = [result];
        } else {
          console.log('Stable Diffusion暂不支持图生图，使用文生图代替');
          const result = await sdGenerateImage(
            {
              apiKey: activeKey.apiKey,
              model: 'stable-diffusion-xl-1024-v1-0',
              width: 1024,
              height: 1024,
              steps: 30,
              cfgScale: 7
            },
            `基于参考图片: ${imagePrompt}`,
            negativePrompt
          );
          imageData = [result];
        }
      } else if (selectedProvider === 'jimeng') {
        const activeKey = getActiveApiKey('jimeng');
        if (!activeKey) {
          throw new Error('请先在API密钥管理页面配置即梦AI API密钥');
        }

        const imagePrompt = jimengBuildImagePrompt(
          '产品',
          prompt,
          sceneType === 'we-media' ? '社交媒体用户' : '电商购物者',
          sceneType,
          '高质量摄影'
        );

        const negativePrompt = jimengBuildNegativePrompt(sceneType);

        const config = {
          apiKey: activeKey.apiKey,
          endpoint: activeKey.endpoint,
          model: 'jimeng-v4.6',
          width: 1024,
          height: 1024,
          steps: 30,
          guidanceScale: 7.5
        };

        if (generationMode === 'text-to-image') {
          const results = await jimengGenerateTextToImage(
            config,
            imagePrompt,
            negativePrompt
          );
          imageData = results;
        } else {
          if (!uploadedImage) {
            throw new Error('请先上传一张图片');
          }
          const results = await jimengGenerateImageToImage(
            config,
            imagePrompt,
            uploadedImage,
            negativePrompt,
            strength
          );
          imageData = results;
        }
      } else if (selectedProvider === 'dashscope') {
        const activeKey = getActiveApiKey('dashscope');
        console.log('获取到的通义万相API密钥信息:', {
          hasActiveKey: !!activeKey,
          keyName: activeKey?.name,
          keyProvider: activeKey?.provider,
          keyId: activeKey?.id,
          keyLength: activeKey?.apiKey?.length,
          keyStartsWithDemo: activeKey?.apiKey?.startsWith('dashscope-demo'),
          hasEndpoint: !!activeKey?.endpoint,
          endpoint: activeKey?.endpoint
        });
        
        if (!activeKey) {
          throw new Error('请先在API密钥管理页面配置阿里云百炼API密钥');
        }
        
        if (activeKey.apiKey.startsWith('dashscope-demo')) {
          console.warn('当前使用的是演示密钥，请在API密钥管理页面添加真实的通义万相API密钥');
          alert('提示：请先在API密钥管理页面添加真实的通义万相API密钥（格式：sk-xxxxxx），当前使用的是演示模式。');
        }
        
        if (activeKey.endpoint) {
          console.warn('当前密钥配置了自定义endpoint，这可能导致问题。建议移除endpoint配置，使用默认地址。');
        }

        const imagePrompt = jimengBuildImagePrompt(
          '产品',
          prompt,
          sceneType === 'we-media' ? '社交媒体用户' : '电商购物者',
          sceneType,
          '高质量摄影'
        );

        const negativePrompt = jimengBuildNegativePrompt(sceneType);

        const config = {
          apiKey: activeKey.apiKey,
          endpoint: activeKey.endpoint,
          model: 'wan2.6-image'
        };

        if (generationMode === 'text-to-image') {
          const results = await dashscopeGenerateTextToImage(
            config,
            imagePrompt,
            {
              negativePrompt,
              width: 1280,
              height: 1280
            }
          );
          imageData = results;
        } else {
          if (!uploadedImage) {
            throw new Error('请先上传一张图片');
          }

          console.log('使用阿里云万相图生图功能');
          
          const imageToImagePrompt = `参考这张图片的风格和作为背景，${imagePrompt}`;
          
          console.log('图生图优化后的提示词:', imageToImagePrompt);
          
          const results = await dashscopeGenerateImageToImage(
            config,
            imageToImagePrompt,
            [uploadedImage],
            {
              negativePrompt,
              width: 1280,
              height: 1280
            }
          );
          imageData = results;
        }
      } else {
        throw new Error(`未知的图片生成提供商: ${selectedProvider}`);
      }

      setGeneratedImages(prev => [...imageData, ...prev].slice(0, 6));

    } catch (error: any) {
      console.error('图片生成失败:', error);
      alert(`图片生成失败: ${error.message}`);

      const fallbackImages = [
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/800/600?random=2'
      ];
      setGeneratedImages(prev => [...fallbackImages, ...prev].slice(0, 6));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    alert('提示词已复制到剪贴板');
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-image-${Date.now()}-${index}.png`;
    link.click();
  };

  const downloadAllImages = () => {
    generatedImages.forEach((imgUrl, idx) => {
      downloadImage(imgUrl, idx);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/${sceneType}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 no-underline"
          >
            <ArrowLeftOutlined />
            返回{sceneConfig.name}首页
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">{sceneConfig.icon}</span>
            <span className="font-medium gradient-text">{sceneConfig.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI图片生成</h1>
            <p className="text-gray-600">
              基于AI模型生成高质量{sceneType === 'we-media' ? '社交图片' : '商品图片'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="card-header">
              <h2 className="card-title">图片配置</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI提供商
                </label>
                <div className="flex gap-2">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors ${selectedProvider === provider.id ? provider.color : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setSelectedProvider(provider.id as 'stablediffusion' | 'jimeng' | 'dashscope')}
                    >
                      <span className="mr-1">{provider.icon}</span>
                      {provider.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成模式
                </label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg transition-colors ${generationMode === 'text-to-image' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setGenerationMode('text-to-image')}
                  >
                    <span className="mr-1">📝</span>
                    文生图
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg transition-colors ${generationMode === 'image-to-image' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setGenerationMode('image-to-image')}
                  >
                    <span className="mr-1">🖼️</span>
                    图生图
                  </button>
                </div>
              </div>

              {generationMode === 'image-to-image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传参考图片
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {uploadedImage ? (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="上传的图片"
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          onClick={removeUploadedImage}
                        >
                          ✕
                        </button>
                        <p className="text-sm text-gray-500">已上传图片，点击重新上传</p>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={triggerFileSelect}
                      >
                        <UploadOutlined className="text-4xl text-gray-400 mb-2" />
                        <p className="text-gray-600">点击上传图片</p>
                        <p className="text-sm text-gray-400">支持JPG、PNG格式，最大10MB</p>
                      </div>
                    )}
                  </div>

                  {uploadedImage && (
                    <div className="mt-3">
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">
                          参考强度: {strength.toFixed(1)}
                        </label>
                        <span className="text-sm text-gray-500">
                          {strength < 0.3 ? '轻微参考' : strength < 0.7 ? '中等参考' : '高度参考'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={strength}
                        onChange={(e) => setStrength(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>弱</span>
                        <span>中</span>
                        <span>强</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  提示词
                </label>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={sceneType === 'we-media'
                    ? '春天的花束，白色背景，简约风格，适合小红书封面'
                    : '智能手表展示，产品主图，白色背景，电商风格'}
                />
              </div>

              <button
                className="w-full gradient-btn py-3 text-lg flex items-center justify-center"
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
                    <PictureOutlined className="mr-2" />
                    {generationMode === 'text-to-image' ? '生成图片' : '图生图'}
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 pt-2 border-t">
                {selectedProvider === 'stablediffusion' ? (
                  <p>使用Stable Diffusion模型生成图片，支持高分辨率图像生成</p>
                ) : selectedProvider === 'dashscope' ? (
                  <p>使用阿里云万相模型生成图片，支持文生图和图生图功能</p>
                ) : (
                  <p>使用即梦AI v4.6模型生成图片，支持文生图和图生图功能</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">生成的图片</h2>
            </div>
            <div className="p-8">
              {generatedImages.length === 0 ? (
                <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-lg mb-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {sceneType === 'we-media' ? '📱' : '🛒'}
                    </div>
                    <p className="text-gray-600 mb-2">点击"生成图片"开始创作</p>
                    <p className="text-sm text-gray-500">
                      {sceneType === 'we-media'
                        ? '生成适合小红书、抖音等平台的图片'
                        : '生成适合电商平台的产品展示图'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {generatedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`生成的图片 ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          onClick={() => downloadImage(img, index)}
                          title="下载"
                        >
                          <DownloadOutlined />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {generatedImages.length > 0 && (
                <div className="flex justify-center">
                  <button
                    className="gradient-btn px-6 py-2"
                    onClick={downloadAllImages}
                  >
                    <DownloadOutlined className="mr-2" />
                    下载所有图片
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGeneration;

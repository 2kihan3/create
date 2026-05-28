import React from 'react';
import { AppstoreOutlined, DownloadOutlined, StarOutlined, FireOutlined } from '@ant-design/icons';
import '../styles/global.css';

const Templates: React.FC = () => {
  // 模板分类
  const templateCategories = [
    { id: 'we-media', name: '自媒体模板', count: 24, icon: '📱', color: 'bg-blue-50 text-blue-700' },
    { id: 'e-commerce', name: '电商模板', count: 18, icon: '🛒', color: 'bg-purple-50 text-purple-700' },
    { id: 'social', name: '社交媒体', count: 32, icon: '💬', color: 'bg-green-50 text-green-700' },
    { id: 'marketing', name: '营销海报', count: 15, icon: '📢', color: 'bg-orange-50 text-orange-700' },
    { id: 'product', name: '产品展示', count: 21, icon: '📦', color: 'bg-red-50 text-red-700' },
    { id: 'festival', name: '节日活动', count: 12, icon: '🎉', color: 'bg-yellow-50 text-yellow-700' },
  ];
  
  // 热门模板
  const popularTemplates = [
    {
      id: 1,
      name: '小红书封面模板',
      category: '自媒体',
      likes: 1245,
      downloads: 2890,
      preview: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop',
      tags: ['简约', '时尚', '小红书']
    },
    {
      id: 2,
      name: '电商产品主图',
      category: '电商',
      likes: 987,
      downloads: 3421,
      preview: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop',
      tags: ['产品', '白底', '电商']
    },
    {
      id: 3,
      name: '抖音视频封面',
      category: '社交媒体',
      likes: 1567,
      downloads: 4213,
      preview: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop',
      tags: ['动态', '吸引', '抖音']
    },
    {
      id: 4,
      name: '促销活动海报',
      category: '营销海报',
      likes: 876,
      downloads: 1987,
      preview: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
      tags: ['促销', '活动', '海报']
    },
    {
      id: 5,
      name: '品牌故事模板',
      category: '产品展示',
      likes: 654,
      downloads: 1234,
      preview: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      tags: ['品牌', '故事', '高级']
    },
    {
      id: 6,
      name: '节日祝福卡片',
      category: '节日活动',
      likes: 432,
      downloads: 876,
      preview: 'https://images.unsplash.com/photo-1512389142860-9c449e38a77f?w=400&h=300&fit=crop',
      tags: ['节日', '祝福', '温馨']
    },
  ];
  
  // 我的收藏
  const myCollections = [
    { id: 1, name: '简约风格合集', count: 8, lastUsed: '2026-04-10' },
    { id: 2, name: '电商主图模板', count: 12, lastUsed: '2026-04-08' },
    { id: 3, name: '社交媒体套装', count: 15, lastUsed: '2026-04-05' },
    { id: 4, name: '品牌视觉规范', count: 5, lastUsed: '2026-04-01' },
  ];
  
  const handleUseTemplate = (templateName: string) => {
    alert(`使用模板: ${templateName}`);
  };
  
  const handlePreview = (templateName: string) => {
    alert(`预览模板: ${templateName}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center gradient-btn">
            <AppstoreOutlined className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">模板库</h1>
            <p className="text-gray-600">丰富的模板资源，快速生成高质量素材</p>
          </div>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索模板、关键词、风格..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-3 text-gray-400">
                🔍
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              最新
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              热门
            </button>
            <button className="px-4 py-2 gradient-btn text-white">
              我的收藏
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：分类和收藏 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 模板分类 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">模板分类</h2>
            </div>
            <div className="space-y-2">
              {templateCategories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.count} 个模板</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${category.color}`}>
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 我的收藏 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <StarOutlined />
                我的收藏
              </h2>
            </div>
            <div className="space-y-3">
              {myCollections.map(collection => (
                <div
                  key={collection.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{collection.name}</div>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                      {collection.count}个
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>上次使用: {collection.lastUsed}</span>
                    <button className="text-blue-600 hover:text-blue-800">
                      打开
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 右侧：模板展示 */}
        <div className="lg:col-span-2">
          {/* 热门模板 */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title flex items-center gap-2">
                  <FireOutlined />
                  热门模板
                </h2>
                <span className="text-sm text-gray-500">本周最受欢迎的模板</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* 模板预览 */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.category === '自媒体' ? 'bg-blue-500' :
                        template.category === '电商' ? 'bg-purple-500' :
                        'bg-green-500'
                      } text-white`}>
                        {template.category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <h3 className="text-white font-medium">{template.name}</h3>
                    </div>
                  </div>
                  
                  {/* 模板信息 */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <StarOutlined className="text-yellow-500" />
                          <span>{template.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DownloadOutlined />
                          <span>{template.downloads}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {template.id}
                      </div>
                    </div>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => handlePreview(template.name)}
                      >
                        预览
                      </button>
                      <button
                        className="flex-1 py-2 gradient-btn text-white rounded-lg"
                        onClick={() => handleUseTemplate(template.name)}
                      >
                        使用模板
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 使用说明 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">如何使用模板</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">选择模板</h3>
                  <p className="text-sm text-gray-600">浏览分类或搜索找到适合的模板</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">自定义内容</h3>
                  <p className="text-sm text-gray-600">替换文字、图片，调整颜色和布局</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">导出使用</h3>
                  <p className="text-sm text-gray-600">下载成品或直接发布到目标平台</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">💡 模板使用提示</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 模板支持一键复制到编辑器中修改</li>
                  <li>• 可以收藏常用模板方便下次使用</li>
                  <li>• 支持批量导出多个尺寸的模板</li>
                  <li>• 专业版用户可上传自定义模板</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
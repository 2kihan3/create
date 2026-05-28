import React, { useState } from 'react';
import { 
  HistoryOutlined, 
  DownloadOutlined, 
  CopyOutlined, 
  DeleteOutlined,
  EyeOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  FilterOutlined,
  EditOutlined,
  PictureOutlined
} from '@ant-design/icons';
import '../styles/global.css';

const History: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // 历史记录分类
  const categories = [
    { id: 'all', name: '全部记录', count: 156, color: 'bg-gray-100 text-gray-700' },
    { id: 'copywriting', name: '文案生成', count: 78, color: 'bg-blue-50 text-blue-700' },
    { id: 'image', name: '图片创作', count: 42, color: 'bg-purple-50 text-purple-700' },
    { id: 'template', name: '模板使用', count: 36, color: 'bg-green-50 text-green-700' },
  ];
  
  // 时间筛选选项
  const timeFilters = [
    { id: 'today', label: '今天' },
    { id: 'week', label: '本周' },
    { id: 'month', label: '本月' },
    { id: 'quarter', label: '近三月' },
    { id: 'year', label: '今年' },
  ];
  
  // 历史记录数据
  const historyItems = [
    {
      id: 1,
      title: '春季护肤品推广文案',
      type: 'copywriting',
      scene: 'we-media',
      content: '春天到了，肌肤也需要焕新！这款清爽型护肤水，含天然植物精华...',
      createdAt: '2026-04-13 14:30',
      size: '2.3KB',
      tags: ['小红书', '护肤', '春季'],
      icon: '📝'
    },
    {
      id: 2,
      title: '智能手表电商主图',
      type: 'image',
      scene: 'e-commerce',
      content: '生成图片：智能手表展示，白色背景，产品特写',
      createdAt: '2026-04-12 10:15',
      size: '1.8MB',
      tags: ['电商', '产品图', '科技'],
      icon: '🖼️'
    },
    {
      id: 3,
      title: '咖啡店宣传海报模板',
      type: 'template',
      scene: 'we-media',
      content: '使用"咖啡馆宣传"模板，替换文字和图片',
      createdAt: '2026-04-11 16:45',
      size: '4.2MB',
      tags: ['模板', '海报', '餐饮'],
      icon: '🎨'
    },
    {
      id: 4,
      title: '618促销活动文案',
      type: 'copywriting',
      scene: 'e-commerce',
      content: '618大促来袭！全场满减，限时折扣，不容错过...',
      createdAt: '2026-04-10 09:20',
      size: '1.9KB',
      tags: ['电商', '促销', '618'],
      icon: '📝'
    },
    {
      id: 5,
      title: '美食摄影图片生成',
      type: 'image',
      scene: 'we-media',
      content: '生成图片：精致下午茶，自然光线，美食摄影',
      createdAt: '2026-04-09 15:10',
      size: '2.1MB',
      tags: ['美食', '摄影', '小红书'],
      icon: '🖼️'
    },
    {
      id: 6,
      title: '品牌故事模板应用',
      type: 'template',
      scene: 'e-commerce',
      content: '使用"品牌故事"模板创建产品详情页',
      createdAt: '2026-04-08 11:30',
      size: '3.5MB',
      tags: ['品牌', '模板', '详情页'],
      icon: '🎨'
    },
    {
      id: 7,
      title: '旅行vlog开场文案',
      type: 'copywriting',
      scene: 'we-media',
      content: '逃离城市，去寻找诗和远方！这次的目的地是...',
      createdAt: '2026-04-07 13:25',
      size: '1.5KB',
      tags: ['旅行', 'vlog', '抖音'],
      icon: '📝'
    },
    {
      id: 8,
      title: '化妆品产品展示图',
      type: 'image',
      scene: 'e-commerce',
      content: '生成图片：口红产品展示，多色号对比',
      createdAt: '2026-04-06 14:40',
      size: '2.4MB',
      tags: ['美妆', '产品图', '电商'],
      icon: '🖼️'
    },
  ];
  
  // 统计信息
  const stats = {
    totalSize: '15.8MB',
    totalItems: 156,
    last30Days: 42,
    mostActive: '周一'
  };
  
  // 过滤历史记录
  const filteredItems = selectedCategory === 'all' 
    ? historyItems 
    : historyItems.filter(item => item.type === selectedCategory);
  
  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };
  
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    alert(`删除选中的 ${selectedItems.length} 条记录`);
    setSelectedItems([]);
  };
  
  const handleDownloadItem = (item: any) => {
    alert(`下载: ${item.title}`);
  };
  
  const handleCopyItem = (item: any) => {
    alert(`复制内容: ${item.title}`);
    navigator.clipboard.writeText(item.content);
  };
  
  const handleViewItem = (item: any) => {
    alert(`查看详情: ${item.title}\n\n${item.content}`);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'copywriting': return <EditOutlined className="text-blue-600" />;
      case 'image': return <PictureOutlined className="text-purple-600" />;
      case 'template': return <EyeOutlined className="text-green-600" />;
      default: return <HistoryOutlined />;
    }
  };
  
  const getSceneColor = (scene: string) => {
    return scene === 'we-media' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center gradient-btn">
            <HistoryOutlined className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">历史记录</h1>
            <p className="text-gray-600">查看和管理您的创作历史</p>
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">总记录数</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.last30Days}</div>
            <div className="text-sm text-gray-600">近30天活跃</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.totalSize}</div>
            <div className="text-sm text-gray-600">占用空间</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.mostActive}</div>
            <div className="text-sm text-gray-600">最活跃时间</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧：分类和筛选 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 记录分类 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">记录分类</h2>
            </div>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{category.name}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${category.color}`}>
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* 时间筛选 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <CalendarOutlined />
                时间筛选
              </h2>
            </div>
            <div className="space-y-2">
              {timeFilters.map(filter => (
                <button
                  key={filter.id}
                  className="w-full text-left p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 批量操作 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">批量操作</h2>
            </div>
            <div className="space-y-2">
              <button
                className="w-full flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={handleSelectAll}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onChange={() => {}}
                  className="rounded"
                />
                <span>全选当前页</span>
              </button>
              <button
                className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  selectedItems.length > 0
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleDeleteSelected}
                disabled={selectedItems.length === 0}
              >
                <DeleteOutlined />
                <span>删除选中 ({selectedItems.length})</span>
              </button>
              <button
                className="w-full flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => alert('导出选中记录')}
              >
                <DownloadOutlined />
                <span>导出选中</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* 右侧：历史记录列表 */}
        <div className="lg:col-span-3">
          {/* 操作工具栏 */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilterOutlined className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  显示 {filteredItems.length} 条记录
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="搜索历史记录..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  搜索
                </button>
              </div>
            </div>
          </div>
          
          {/* 历史记录列表 */}
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`card cursor-pointer transition-all hover:shadow-md ${
                  selectedItems.includes(item.id) ? 'border-blue-300 bg-blue-50' : ''
                }`}
                onClick={() => handleSelectItem(item.id)}
              >
                <div className="flex items-start gap-4">
                  {/* 选择框 */}
                  <div className="pt-5">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* 图标 */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                    {getTypeIcon(item.type)}
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSceneColor(item.scene)}`}>
                          {item.scene === 'we-media' ? '自媒体' : '电商'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.createdAt}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="text-xs text-gray-500">
                          {item.size}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 text-gray-500 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewItem(item);
                          }}
                          title="查看详情"
                        >
                          <EyeOutlined />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyItem(item);
                          }}
                          title="复制内容"
                        >
                          <CopyOutlined />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-purple-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadItem(item);
                          }}
                          title="下载"
                        >
                          <DownloadOutlined />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`删除: ${item.title}`);
                          }}
                          title="删除"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页 */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              第 1 页，共 8 页
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                上一页
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                ...
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                下一页
              </button>
            </div>
          </div>
          
          {/* 清空历史提示 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">🗑️ 清理存储空间</h4>
                <p className="text-sm text-gray-600">
                  定期清理历史记录可以释放存储空间，建议保留重要记录。
                </p>
              </div>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                onClick={() => alert('清空所有历史记录')}
              >
                清空全部历史
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
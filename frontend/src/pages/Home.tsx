import React from 'react';
import { 
  RocketOutlined, 
  FileTextOutlined, 
  PictureOutlined, 
  AppstoreOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FireOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useSceneStore } from '../store/sceneStore';
import { Link } from 'react-router-dom';
import '../styles/global.css';

interface HomeProps {
  sceneType: 'we-media' | 'e-commerce';
}

const Home: React.FC<HomeProps> = ({ sceneType }) => {
  const { scenes, recentProjects, switchScene } = useSceneStore();
  const sceneConfig = scenes[sceneType];
  
  // 核心功能快速入口
  const coreFeatures = [
    {
      title: '文案生成',
      icon: <FileTextOutlined className="text-lg" />,
      description: sceneType === 'we-media' 
        ? '创作小红书、抖音等平台的优质文案' 
        : '生成商品描述、促销文案等电商内容',
      gradient: 'from-blue-500 to-purple-500',
      path: `/${sceneType}/copywriting`
    },
    {
      title: '图片创作',
      icon: <PictureOutlined className="text-lg" />,
      description: sceneType === 'we-media'
        ? '设计社交媒体封面、配图等视觉素材'
        : '制作产品主图、详情页、活动海报等',
      gradient: 'from-green-500 to-teal-500',
      path: `/${sceneType}/image-generation`
    },
    {
      title: '模板库',
      icon: <AppstoreOutlined className="text-lg" />,
      description: '使用预设模板快速生成内容',
      gradient: 'from-orange-500 to-red-500',
      path: '/templates'
    }
  ];
  
  // 场景特定的推荐模板
  const templateCategories = sceneConfig.templateCategories.map(category => ({
    name: category,
    count: Math.floor(Math.random() * 20) + 5
  }));
  
  // 热门文案风格
  const popularStyles = sceneType === 'we-media' ? [
    "这套穿搭也太适合春天了吧！",
    "5分钟搞定早餐，健康又美味",
    "旅行必带的5件好物，后悔没早点买",
    "智能家居让生活更便捷",
    "周末探店：这家咖啡店值得打卡"
  ] : [
    "限时特惠！买一送一",
    "新品上市，立即尝鲜",
    "爆款推荐，好评如潮",
    "满减活动，叠加优惠",
    "会员专享，独家福利"
  ];
  
  // 过滤当前场景的最近项目
  const filteredRecentProjects = recentProjects.filter(
    project => project.scene === sceneType
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              欢迎使用素材生成工作台
            </h1>
            <p className="text-gray-600">
              当前场景：<span className="font-semibold gradient-text">{sceneConfig.name}</span> · {sceneConfig.description}
            </p>
          </div>
          <Link 
            to={`/${sceneType}/copywriting`}
            className="gradient-btn px-6 py-3 text-lg no-underline flex items-center gap-2"
          >
            <RocketOutlined />
            开始创作
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 快速开始 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">快速开始</h2>
                <span className="text-sm text-gray-500">选择功能立即开始</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coreFeatures.map((feature, index) => (
                <Link
                  key={index}
                  to={feature.path}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group no-underline text-gray-900"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sceneType === 'we-media' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {sceneType === 'we-media' ? '自媒体' : '电商'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                  <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                    <span>立即开始</span>
                    <ArrowRightOutlined className="ml-1 text-xs" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* 最近项目 */}
        <div>
          <div className="card h-full">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title flex items-center gap-2">
                  <ClockCircleOutlined />
                  最近项目
                </h2>
                <span className="text-sm text-gray-500">最近操作</span>
              </div>
            </div>
            <div className="space-y-3">
              {filteredRecentProjects.length > 0 ? (
                filteredRecentProjects.map(project => (
                  <div
                    key={project.id}
                    className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => alert(`打开项目: ${project.name}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.scene === 'we-media' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-purple-50 text-purple-600'
                      }`}>
                        {project.scene === 'we-media' ? '自媒体' : '电商'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      最后修改：{project.lastModified}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>点击继续编辑</span>
                      <ArrowRightOutlined className="ml-1 text-xs" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无最近项目
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 推荐模板 */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title flex items-center gap-2">
                <StarOutlined />
                推荐模板（{sceneConfig.name}）
              </h2>
              <span className="text-sm text-gray-500">按分类浏览</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {templateCategories.map((category, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-sm transition-shadow cursor-pointer group"
                onClick={() => alert(`浏览 ${category.name} 模板`)}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all">
                  <span className="text-white text-xl">
                    {category.name === '日常分享' && '📝'}
                    {category.name === '教程步骤' && '📚'}
                    {category.name === '好物推荐' && '🎁'}
                    {category.name === '旅行打卡' && '✈️'}
                    {category.name === '美食分享' && '🍕'}
                    {category.name === '商品主图' && '📦'}
                    {category.name === '详情页模板' && '📄'}
                    {category.name === '促销海报' && '🎉'}
                    {category.name === '活动横幅' && '🏷️'}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.count} 个模板</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* 热门文案风格 */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title flex items-center gap-2">
                <FireOutlined />
                近期热门文案风格
              </h2>
              <span className="text-sm text-gray-500">AI推荐</span>
            </div>
          </div>
          <div className="space-y-4">
            {popularStyles.map((style, index) => (
              <div
                key={index}
                className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => alert(`使用"${style}"风格`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      "{style}"
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>点击应用此风格</span>
                      <ArrowRightOutlined className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* API密钥状态提示 */}
      <div className="mt-8 card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <FileTextOutlined className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">API密钥管理</h3>
              <p className="text-sm text-gray-600">
                已配置 2 个API密钥，点击右上角用户菜单进行管理
              </p>
            </div>
          </div>
          <button 
            className="gradient-btn px-6"
            onClick={() => alert('打开API密钥管理')}
          >
            管理密钥
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
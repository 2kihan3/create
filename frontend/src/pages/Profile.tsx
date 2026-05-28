import React from 'react';
import { UserOutlined, MailOutlined, CalendarOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import '../styles/global.css';

const Profile: React.FC = () => {
  // 用户信息
  const userInfo = {
    name: '产品经理',
    email: 'pm@example.com',
    role: '高级产品经理',
    joinDate: '2026-01-15',
    usage: {
      projects: 42,
      apiKeys: 3,
      totalUsage: '156.2小时',
    },
    preferences: {
      autoSave: true,
      darkMode: false,
      notifications: true,
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center gradient-btn">
            <UserOutlined className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
            <p className="text-gray-600">管理您的账户信息和偏好设置</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：个人信息 */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">个人信息</h2>
            </div>
            <div className="space-y-6">
              {/* 头像和基本信息 */}
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full gradient-btn flex items-center justify-center text-white text-4xl">
                  {userInfo.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{userInfo.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MailOutlined />
                          <span>{userInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <CalendarOutlined />
                          <span>加入于 {userInfo.joinDate}</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <EditOutlined />
                      编辑资料
                    </button>
                  </div>
                  
                  {/* 角色标签 */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {userInfo.role}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      已验证用户
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 使用统计 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userInfo.usage.projects}</div>
                  <div className="text-sm text-gray-600">项目数</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userInfo.usage.apiKeys}</div>
                  <div className="text-sm text-gray-600">API密钥</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userInfo.usage.totalUsage}</div>
                  <div className="text-sm text-gray-600">总使用时长</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 最近活动 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">最近活动</h2>
            </div>
            <div className="space-y-4">
              {[
                { action: '创建了项目 "春季穿搭分享"', time: '2小时前', scene: '自媒体' },
                { action: '使用模板 "小红书封面"', time: '昨天', scene: '自媒体' },
                { action: '添加了新的API密钥', time: '2天前', scene: '通用' },
                { action: '导出了项目 "智能手表详情页"', time: '3天前', scene: '电商' },
                { action: '分享了模板 "促销海报"', time: '1周前', scene: '电商' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.scene === '自媒体' ? 'bg-blue-100 text-blue-600' : 
                    activity.scene === '电商' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.scene === '自媒体' ? '📱' : activity.scene === '电商' ? '🛒' : '⚙️'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.action}</div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.scene === '自媒体' ? 'bg-blue-50 text-blue-700' : 
                    activity.scene === '电商' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.scene}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 右侧：偏好设置 */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <SettingOutlined />
                偏好设置
              </h2>
            </div>
            <div className="space-y-4">
              {[
                { name: '自动保存', key: 'autoSave', value: userInfo.preferences.autoSave },
                { name: '夜间模式', key: 'darkMode', value: userInfo.preferences.darkMode },
                { name: '邮件通知', key: 'notifications', value: userInfo.preferences.notifications },
                { name: '快捷键提示', key: 'shortcuts', value: true },
                { name: '导出水印', key: 'watermark', value: false },
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{setting.name}</div>
                    <div className="text-sm text-gray-500">启用或禁用此功能</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={setting.value} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* 账户安全 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">账户安全</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                修改密码
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                两步验证设置
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                登录设备管理
              </button>
            </div>
          </div>
          
          {/* 帮助和支持 */}
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
            <h3 className="font-medium text-gray-900 mb-2">需要帮助？</h3>
            <p className="text-sm text-gray-600 mb-3">
              查看文档或联系支持团队
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                帮助中心
              </button>
              <button className="flex-1 py-2 gradient-btn text-white rounded-lg">
                联系支持
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React from 'react';
import { SettingOutlined, BellOutlined, GlobalOutlined, CloudOutlined, ExperimentOutlined } from '@ant-design/icons';
import '../styles/global.css';

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center gradient-btn">
            <SettingOutlined className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">设置</h1>
            <p className="text-gray-600">配置系统偏好和工作环境</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要设置区域 */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">系统设置</h2>
            </div>
            <div className="space-y-6">
              {/* 语言和地区 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <GlobalOutlined />
                  语言和地区
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">语言</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>简体中文</option>
                      <option>English</option>
                      <option>日本語</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">时区</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Asia/Shanghai (UTC+8)</option>
                      <option>Asia/Tokyo (UTC+9)</option>
                      <option>America/New_York (UTC-5)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 通知设置 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <BellOutlined />
                  通知设置
                </h3>
                <div className="space-y-3">
                  {[
                    { name: '任务完成通知', description: '当生成任务完成时通知' },
                    { name: '系统更新提醒', description: '新版本可用时提醒' },
                    { name: 'API用量提醒', description: 'API使用量达到阈值时提醒' },
                    { name: '模板更新通知', description: '收藏的模板有更新时通知' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 存储设置 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CloudOutlined />
                  存储设置
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">本地存储空间</span>
                      <span className="text-sm text-gray-500">156 MB / 1 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '15.6%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">自动清理</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>30天后自动清理</option>
                        <option>永不自动清理</option>
                        <option>7天后清理</option>
                        <option>90天后清理</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">备份频率</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>每天自动备份</option>
                        <option>每周备份</option>
                        <option>手动备份</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 高级设置 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <ExperimentOutlined />
                高级设置
              </h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">模型缓存</h4>
                <p className="text-sm text-gray-600 mb-3">
                  启用模型缓存可以加快后续生成速度，但会占用更多存储空间。
                </p>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">启用模型缓存</span>
                </label>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">开发者选项</h4>
                <p className="text-sm text-gray-600 mb-3">
                  这些选项适用于开发者，普通用户建议保持默认设置。
                </p>
                <div className="space-y-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">调试日志</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">API请求日志</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧：快速操作 */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">快速操作</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                导出所有设置
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                重置为默认设置
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                检查更新
              </button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">系统信息</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">版本</span>
                <span className="text-sm font-medium text-gray-900">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">最后更新</span>
                <span className="text-sm font-medium text-gray-900">2026-04-13</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">构建ID</span>
                <span className="text-sm font-medium text-gray-900">#B3ZZDvLT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">环境</span>
                <span className="text-sm font-medium text-gray-900">Production</span>
              </div>
            </div>
          </div>
          
          {/* 危险区域 */}
          <div className="card border-red-200">
            <div className="card-header">
              <h2 className="card-title text-red-700">危险区域</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-700">
                清除所有缓存
              </button>
              <button className="w-full text-left p-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-700">
                删除所有历史记录
              </button>
              <button className="w-full text-left p-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-700">
                注销账户
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 保存设置按钮 */}
      <div className="mt-8 flex justify-end gap-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          取消
        </button>
        <button className="px-6 py-2 gradient-btn text-white rounded-lg">
          保存设置
        </button>
      </div>
    </div>
  );
};

export default Settings;
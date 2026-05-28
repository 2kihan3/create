import React from 'react';
import Header from './Header';
import '../styles/global.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-6">
        {children}
      </main>
      
      {/* 页脚 */}
      <footer className="mt-12 border-t border-gray-200 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-btn">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  内容生成工作台
                </div>
              </div>
              <p className="text-sm text-gray-600">
                基于 LangGraph 的小红书内容生成与项目工作台。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">主要功能</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>项目记忆</li>
                <li>选题 todo</li>
                <li>文案确认</li>
                <li>图片确认</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">场景支持</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>小红书图文</li>
                <li>账号定位</li>
                <li>多模型 API</li>
                <li>本地资产管理</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">联系我们</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>反馈建议: feedback@example.com</li>
                <li>技术支持: support@example.com</li>
                <li>商务合作: business@example.com</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-500">
            <p>© 2026 内容生成工作台. 本地开发版本 v0.1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

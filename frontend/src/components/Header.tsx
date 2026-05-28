import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppstoreOutlined,
  HistoryOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ApiOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import '../styles/global.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  const mainNavItems = [
    {
      key: 'projects',
      label: '项目工作台',
      icon: <ProjectOutlined />,
      path: '/projects',
      description: '小红书项目、选题和生成流程'
    },
    {
      key: 'model-configs',
      label: '模型/API',
      icon: <ApiOutlined />,
      path: '/model-configs',
      description: '文本、图片和视频模型配置'
    },
    {
      key: 'templates',
      label: '模板库',
      icon: <AppstoreOutlined />,
      path: '/templates'
    },
    {
      key: 'history',
      label: '历史记录',
      icon: <HistoryOutlined />,
      path: '/history'
    }
  ];
  
  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', path: '/profile' },
    { key: 'model-configs', icon: <ApiOutlined />, label: '模型/API管理', path: '/model-configs' },
    { key: 'settings', icon: <SettingOutlined />, label: '设置', path: '/settings' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', path: '/logout' }
  ];

  const isActive = (path: string) => {
    if (path === '/projects') return location.pathname.startsWith('/projects');
    return location.pathname === path;
  };

  const handleUserMenuClick = () => {
    setUserMenuVisible(false);
  };
  
  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-btn">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="text-xl font-bold gradient-text">
                内容生成工作台
              </div>
            </Link>
          </div>

          <nav className="flex items-center gap-1">
            {mainNavItems.map(item => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors no-underline ${
                    active
                      ? 'gradient-btn text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                  }`}
                  title={item.description}
                >
                  {typeof item.icon === 'string' ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : (
                    item.icon
                  )}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* 用户菜单 */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-full gradient-btn"
              onClick={() => setUserMenuVisible(!userMenuVisible)}
            >
              <UserOutlined />
              <span className="font-medium">用户</span>
            </button>
            
            {/* 用户下拉菜单 */}
            {userMenuVisible && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {userMenuItems.map((item, index) => {
                  if (item.type === 'divider') {
                    return <div key={`divider-${index}`} className="border-t border-gray-200 my-2" />;
                  }
                  
                  const menuItem = item as { key: string; icon: React.ReactNode; label: string; path: string };
                  return (
                    <Link
                      key={menuItem.key}
                      to={menuItem.path}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-700 no-underline"
                      onClick={handleUserMenuClick}
                    >
                      {menuItem.icon}
                      <span>{menuItem.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

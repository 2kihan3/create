import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Templates from './pages/Templates';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Projects from './pages/projects/Projects';
import ProjectWorkbench from './pages/projects/ProjectWorkbench';
import ModelConfigs from './pages/ModelConfigs';
import './styles/global.css';

// 简单的登出页面组件
const Logout = () => {
  React.useEffect(() => {
    alert('已退出登录');
    window.location.href = '/';
  }, []);
  return <div className="container mx-auto px-4 py-8 text-center">退出登录中...</div>;
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectWorkbench />} />
          <Route path="/model-configs" element={<ModelConfigs />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/api-keys" element={<Navigate to="/model-configs" replace />} />
          <Route path="/we-media/*" element={<Navigate to="/projects" replace />} />
          <Route path="/e-commerce/*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

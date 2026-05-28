import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { api } from '../../api/client';
import type { Project } from '../../api/client';
import '../../styles/global.css';

const defaultMemory = {
  positioning: '面向正在提升生活品质的年轻女性，真实分享、轻知识、轻种草。',
  audience: '20-35岁，小红书活跃用户，关注效率、审美和实用体验。',
  tone: '亲切、真实、有细节，避免夸张营销口吻。',
  taboos: '不做绝对化承诺，不使用虚假体验，不强行制造焦虑。',
  benchmark_tags: ['真实测评', '生活方式', '步骤清晰', '封面干净'],
};

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('小红书内容项目');
  const [memoryText, setMemoryText] = useState(JSON.stringify(defaultMemory, null, 2));
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setProjects(await api.listProjects());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createProject = async () => {
    let memory = defaultMemory;
    try {
      memory = JSON.parse(memoryText);
    } catch {
      alert('账号定位 JSON 格式有误');
      return;
    }
    const project = await api.createProject({ name, project_type: 'xhs', memory });
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">项目工作台</h1>
          <p className="text-gray-600">从小红书项目开始，管理账号定位、选题 todo、文案和图片确认流程。</p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={load}>
          <ReloadOutlined className={loading ? 'animate-spin mr-2' : 'mr-2'} />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="card-header">
              <h2 className="card-title">新建小红书项目</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">账号定位/项目记忆</label>
                <textarea className="w-full h-72 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" value={memoryText} onChange={(event) => setMemoryText(event.target.value)} />
              </div>
              <button className="w-full gradient-btn py-3 flex items-center justify-center gap-2" onClick={createProject}>
                <PlusOutlined />
                创建项目
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">我的项目</h2>
            </div>
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-16 text-gray-500">还没有项目，先创建一个小红书内容项目。</div>
              ) : (
                projects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="block border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow no-underline text-gray-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-600">类型：小红书图文 · 状态：{project.status}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">进入工作台</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;

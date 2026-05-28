import React, { useEffect, useState } from 'react';
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { api } from '../api/client';
import type { ModelConfig } from '../api/client';
import '../styles/global.css';

const emptyForm = {
  name: '',
  provider: 'deepseek',
  model_type: 'text',
  model_name: 'deepseek-chat',
  endpoint: '',
  api_key: '',
  cost_label: '',
  default_params: '{\n  "temperature": 0.7,\n  "max_tokens": 1600\n}',
};

const ModelConfigs: React.FC = () => {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setConfigs(await api.listModelConfigs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    let params = {};
    try {
      params = JSON.parse(form.default_params || '{}');
    } catch {
      alert('默认参数 JSON 格式有误');
      return;
    }
    await api.createModelConfig({
      name: form.name,
      provider: form.provider,
      model_type: form.model_type as ModelConfig['model_type'],
      model_name: form.model_name,
      endpoint: form.endpoint || undefined,
      api_key: form.api_key || undefined,
      cost_label: form.cost_label || undefined,
      default_params: params,
      is_enabled: true,
    });
    setForm(emptyForm);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('确定删除这个模型配置吗？')) return;
    await api.deleteModelConfig(id);
    await load();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">模型/API 管理</h1>
          <p className="text-gray-600">统一管理文本、图片和视频模型。项目执行前会从这里选择默认配置。</p>
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
              <h2 className="card-title">新增模型配置</h2>
            </div>
            <div className="space-y-4">
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="配置名称" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="px-3 py-2 border border-gray-300 rounded-lg" value={form.model_type} onChange={(event) => setForm({ ...form, model_type: event.target.value })}>
                  <option value="text">文本模型</option>
                  <option value="image">图片模型</option>
                  <option value="video">视频模型</option>
                </select>
                <input className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="供应商" value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} />
              </div>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="模型名，如 deepseek-chat / wan2.6-image" value={form.model_name} onChange={(event) => setForm({ ...form, model_name: event.target.value })} />
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Endpoint，可选" value={form.endpoint} onChange={(event) => setForm({ ...form, endpoint: event.target.value })} />
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" type="password" placeholder="API Key" value={form.api_key} onChange={(event) => setForm({ ...form, api_key: event.target.value })} />
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="成本标签，如 低成本/高质量" value={form.cost_label} onChange={(event) => setForm({ ...form, cost_label: event.target.value })} />
              <textarea className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" value={form.default_params} onChange={(event) => setForm({ ...form, default_params: event.target.value })} />
              <button className="w-full gradient-btn py-3 flex items-center justify-center gap-2" onClick={save}>
                <PlusOutlined />
                保存配置
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">配置列表</h2>
            </div>
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{config.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{config.model_type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{config.provider}</span>
                      </div>
                      <p className="text-sm text-gray-600">{config.model_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{config.endpoint || '默认 endpoint'} · {config.api_key_masked || '未配置 key'}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-600" onClick={() => remove(config.id)}>
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelConfigs;

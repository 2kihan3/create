import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckOutlined, CloseOutlined, DeleteOutlined, PictureOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { API_BASE, api } from '../../api/client';
import type { ModelConfig, Project, XhsTopic } from '../../api/client';
import '../../styles/global.css';

const statusLabels: Record<string, string> = {
  planned: '待生成',
  copy_pending_review: '文案待确认',
  copy_approved: '文案已通过',
  images_pending_review: '图片待确认',
  completed: '已完成',
};

const ProjectWorkbench: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [weekGoal, setWeekGoal] = useState('围绕账号定位规划一周 3-5 篇小红书图文内容');
  const [extraInfo, setExtraInfo] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState('');

  const topics = project?.topics || [];
  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) || topics[0],
    [topics, selectedTopicId],
  );

  const load = async () => {
    if (!id) return;
    const [nextProject, nextModels] = await Promise.all([api.getProject(id), api.listModelConfigs()]);
    setProject(nextProject);
    setModels(nextModels);
    if (!selectedTopicId && nextProject.topics?.[0]) setSelectedTopicId(nextProject.topics[0].id);
  };

  useEffect(() => {
    load();
  }, [id]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try {
      await fn();
      await load();
      setFeedback('');
    } catch (error: any) {
      alert(error.message || String(error));
    } finally {
      setBusy('');
    }
  };

  const updateModel = async (modelType: 'text' | 'image', value: string) => {
    if (!project) return;
    await api.updateModelSelection(project.id, {
      text_model_config_id: modelType === 'text' ? value : project.default_text_model_config_id,
      image_model_config_id: modelType === 'image' ? value : project.default_image_model_config_id,
    });
    await load();
  };

  const generateTopics = () => run('topics', () => api.generateTopics(project!.id, { week_goal: weekGoal, count: 5 }));
  const generateCopy = (topic: XhsTopic) => run('copy', () => api.generateCopy(topic.id, { extra_info: extraInfo }));
  const approveCopy = (topic: XhsTopic) => run('approveCopy', () => api.reviewCopy(topic.id, { approved: true }));
  const rejectCopy = (topic: XhsTopic) => run('rejectCopy', () => api.reviewCopy(topic.id, { approved: false, feedback }));
  const generateImages = (topic: XhsTopic) => run('images', () => api.generateImages(topic.id, { count: 3, feedback: feedback || undefined }));
  const approveImages = (topic: XhsTopic) => run('approveImages', () => api.reviewImages(topic.id, { approved: true }));
  const rejectImages = (topic: XhsTopic) => run('rejectImages', () => api.reviewImages(topic.id, { approved: false, feedback }));

  if (!project) {
    return <div className="container mx-auto px-4 py-16 text-gray-500">加载项目中...</div>;
  }

  const textModels = models.filter((model) => model.model_type === 'text' && model.is_enabled);
  const imageModels = models.filter((model) => model.model_type === 'image' && model.is_enabled);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
          <p className="text-gray-600">统一项目工作台：账号记忆、选题 todo、文案确认和图片确认都在这里完成。</p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={load}>
          <ReloadOutlined className="mr-2" />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">项目记忆</h2>
            </div>
            <pre className="text-sm whitespace-pre-wrap text-gray-700 bg-gray-50 rounded-lg p-3 max-h-80 overflow-auto">
              {JSON.stringify(project.memory, null, 2)}
            </pre>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">模型选择</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">文本模型</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={project.default_text_model_config_id || ''} onChange={(event) => updateModel('text', event.target.value)}>
                  <option value="">默认/mock</option>
                  {textModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">图片模型</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={project.default_image_model_config_id || ''} onChange={(event) => updateModel('image', event.target.value)}>
                  <option value="">默认/mock</option>
                  {imageModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">一周选题计划</h2>
            </div>
            <textarea className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg mb-3" value={weekGoal} onChange={(event) => setWeekGoal(event.target.value)} />
            <button disabled={!!busy} className="w-full gradient-btn py-2" onClick={generateTopics}>
              {busy === 'topics' ? '生成中...' : '生成 3-5 个选题'}
            </button>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="card h-full">
            <div className="card-header">
              <h2 className="card-title">选题 todo</h2>
            </div>
            <div className="space-y-3">
              {topics.length === 0 ? (
                <div className="text-center py-12 text-gray-500">先生成本周选题。</div>
              ) : (
                topics.map((topic) => (
                  <button
                    key={topic.id}
                    className={`w-full text-left border rounded-lg p-3 ${selectedTopic?.id === topic.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setSelectedTopicId(topic.id)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{topic.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white text-blue-700">{statusLabels[topic.status] || topic.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">{topic.brief}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          {!selectedTopic ? (
            <div className="card text-center py-20 text-gray-500">请选择一个选题。</div>
          ) : (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="card-title">{selectedTopic.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">{selectedTopic.angle} · {selectedTopic.brief}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-600" onClick={() => run('delete', () => api.deleteTopic(selectedTopic.id))}>
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">用户补充信息</label>
                    <textarea className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg" value={extraInfo} onChange={(event) => setExtraInfo(event.target.value)} placeholder="可以补充产品信息、真实体验、图片要求..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">否定反馈/返工要求</label>
                    <textarea className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="例如：语气更真实一些，减少营销感；第2张图换成室内场景..." />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button disabled={!!busy} className="gradient-btn px-4 py-2" onClick={() => generateCopy(selectedTopic)}>
                    <SendOutlined className="mr-2" />
                    {selectedTopic.copy?.body ? '重新生成文案' : '生成文案'}
                  </button>
                  <button disabled={!selectedTopic.copy?.body || !!busy} className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:bg-gray-300" onClick={() => approveCopy(selectedTopic)}>
                    <CheckOutlined className="mr-2" />文案通过
                  </button>
                  <button disabled={!selectedTopic.copy?.body || !!busy} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:bg-gray-50" onClick={() => rejectCopy(selectedTopic)}>
                    <CloseOutlined className="mr-2" />文案返工
                  </button>
                  <button disabled={selectedTopic.status !== 'copy_approved' || !!busy} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300" onClick={() => generateImages(selectedTopic)}>
                    <PictureOutlined className="mr-2" />生成图片
                  </button>
                </div>
              </div>

              {selectedTopic.copy?.body && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">文案草稿</h2>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{selectedTopic.copy.title}</h3>
                  <div className="whitespace-pre-wrap text-gray-800 leading-7">{selectedTopic.copy.body}</div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(selectedTopic.copy.tags || []).map((tag) => <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">#{tag}</span>)}
                  </div>
                </div>
              )}

              {selectedTopic.images?.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <h2 className="card-title">图片组</h2>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white" onClick={() => approveImages(selectedTopic)}>采纳并完成</button>
                        <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700" onClick={() => rejectImages(selectedTopic)}>返工</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedTopic.images.map((image, index) => (
                      <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <img src={`${API_BASE}${image.url}`} className="w-full aspect-[3/4] object-cover bg-gray-100" />
                        <div className="p-3 text-xs text-gray-600">图 {index + 1} · {image.metadata?.prompt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkbench;

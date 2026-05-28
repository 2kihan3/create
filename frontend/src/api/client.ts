export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  model_type: 'text' | 'image' | 'video';
  model_name: string;
  endpoint?: string;
  api_key?: string;
  api_key_masked?: string;
  default_params: Record<string, unknown>;
  cost_label?: string;
  is_enabled: boolean;
  test_status: string;
}

export interface XhsTopic {
  id: string;
  project_id: string;
  title: string;
  angle: string;
  brief: string;
  status: string;
  sort_order: number;
  copy: {
    title?: string;
    body?: string;
    tags?: string[];
    review_feedback?: string;
    image_review_feedback?: string;
  };
  image_prompts: string[];
  images: Array<{ id: string; url: string; metadata?: { prompt?: string } }>;
}

export interface Project {
  id: string;
  name: string;
  project_type: 'xhs' | 'short_drama';
  status: string;
  memory: Record<string, unknown>;
  default_text_model_config_id?: string;
  default_image_model_config_id?: string;
  default_video_model_config_id?: string;
  topics?: XhsTopic[];
  assets?: unknown[];
  updated_at: string;
}

export const api = {
  listProjects: () => request<Project[]>('/api/projects'),
  getProject: (id: string) => request<Project>(`/api/projects/${id}`),
  createProject: (payload: Partial<Project> & { name: string }) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id: string, payload: Partial<Project>) =>
    request<Project>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateModelSelection: (id: string, payload: {
    text_model_config_id?: string;
    image_model_config_id?: string;
    video_model_config_id?: string;
  }) => request<Project>(`/api/projects/${id}/model-selection`, { method: 'POST', body: JSON.stringify(payload) }),

  listModelConfigs: (modelType?: string) =>
    request<ModelConfig[]>(`/api/model-configs${modelType ? `?model_type=${modelType}` : ''}`),
  createModelConfig: (payload: Partial<ModelConfig>) =>
    request<ModelConfig>('/api/model-configs', { method: 'POST', body: JSON.stringify(payload) }),
  updateModelConfig: (id: string, payload: Partial<ModelConfig>) =>
    request<ModelConfig>(`/api/model-configs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteModelConfig: (id: string) => request<{ ok: boolean }>(`/api/model-configs/${id}`, { method: 'DELETE' }),

  generateTopics: (projectId: string, payload: { week_goal?: string; count: number }) =>
    request<XhsTopic[]>(`/api/projects/${projectId}/xhs/topics/generate`, { method: 'POST', body: JSON.stringify(payload) }),
  updateTopic: (topicId: string, payload: Partial<XhsTopic>) =>
    request<XhsTopic>(`/api/xhs/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTopic: (topicId: string) => request<{ ok: boolean }>(`/api/xhs/topics/${topicId}`, { method: 'DELETE' }),
  generateCopy: (topicId: string, payload: { extra_info?: string }) =>
    request<XhsTopic>(`/api/xhs/topics/${topicId}/copy/generate`, { method: 'POST', body: JSON.stringify(payload) }),
  reviewCopy: (topicId: string, payload: {
    approved: boolean;
    feedback?: string;
    edited_title?: string;
    edited_body?: string;
    edited_tags?: string[];
  }) => request<XhsTopic>(`/api/xhs/topics/${topicId}/copy/review`, { method: 'POST', body: JSON.stringify(payload) }),
  generateImages: (topicId: string, payload: { count: number; regenerate_indices?: number[]; feedback?: string }) =>
    request<XhsTopic>(`/api/xhs/topics/${topicId}/images/generate`, { method: 'POST', body: JSON.stringify(payload) }),
  reviewImages: (topicId: string, payload: {
    approved: boolean;
    feedback?: string;
    regenerate_indices?: number[];
    regenerate_all?: boolean;
  }) => request<XhsTopic>(`/api/xhs/topics/${topicId}/images/review`, { method: 'POST', body: JSON.stringify(payload) }),
};

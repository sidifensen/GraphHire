import apiClient from './client';

export interface SkillTag {
  id: number;
  name: string;
  category: string;
  synonyms: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSkillTagRequest {
  name: string;
  category: string;
  synonyms?: string[];
}

export interface UpdateSkillTagRequest {
  name?: string;
  category?: string;
}

export interface NormalizeSkillTagRequest {
  name: string;
}

export const skillTagApi = {
  // POST /skill-tags — 创建标签
  create: async (data: CreateSkillTagRequest): Promise<SkillTag> => {
    const response = await apiClient.post('/skill-tags', data);
    return response.data;
  },

  // PUT /skill-tags/{id} — 更新标签
  update: async (id: number, data: UpdateSkillTagRequest): Promise<SkillTag> => {
    const response = await apiClient.put(`/skill-tags/${id}`, data);
    return response.data;
  },

  // GET /skill-tags/{id} — 获取标签详情
  getById: async (id: number): Promise<SkillTag> => {
    const response = await apiClient.get(`/skill-tags/${id}`);
    return response.data;
  },

  // GET /skill-tags/name/{name} — 按名称获取
  getByName: async (name: string): Promise<SkillTag> => {
    const response = await apiClient.get(`/skill-tags/name/${encodeURIComponent(name)}`);
    return response.data;
  },

  // GET /skill-tags — 获取所有标签
  getAll: async (): Promise<SkillTag[]> => {
    const response = await apiClient.get('/skill-tags');
    return response.data;
  },

  // GET /skill-tags/category/{category} — 按分类获取
  getByCategory: async (category: string): Promise<SkillTag[]> => {
    const response = await apiClient.get(`/skill-tags/category/${encodeURIComponent(category)}`);
    return response.data;
  },

  // POST /skill-tags/{id}/synonyms — 添加同义词
  addSynonym: async (id: number, synonym: string): Promise<SkillTag> => {
    const response = await apiClient.post(`/skill-tags/${id}/synonyms`, { synonym });
    return response.data;
  },

  // DELETE /skill-tags/{id}/synonyms/{synonym} — 删除同义词
  removeSynonym: async (id: number, synonym: string): Promise<void> => {
    await apiClient.delete(`/skill-tags/${id}/synonyms/${encodeURIComponent(synonym)}`);
  },

  // PUT /skill-tags/{id}/category — 更新分类
  updateCategory: async (id: number, category: string): Promise<SkillTag> => {
    const response = await apiClient.put(`/skill-tags/${id}/category`, { category });
    return response.data;
  },

  // POST /skill-tags/normalize — 标准化
  normalize: async (data: NormalizeSkillTagRequest): Promise<SkillTag> => {
    const response = await apiClient.post('/skill-tags/normalize', data);
    return response.data;
  },

  // DELETE /skill-tags/{id} — 删除
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/skill-tags/${id}`);
  },
};
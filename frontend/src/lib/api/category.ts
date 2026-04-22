import apiClient from './client';

export interface SkillCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const categoryApi = {
  /**
   * 获取所有分类
   */
  getCategories: async (): Promise<SkillCategory[]> => {
    const response = await apiClient.get('/admin/skill/categories');
    return response.data;
  },

  /**
   * 创建分类
   */
  createCategory: async (data: { name: string; description?: string; parentId?: number; sortOrder?: number }): Promise<SkillCategory> => {
    const response = await apiClient.post('/admin/skill/categories', data);
    return response.data;
  },

  /**
   * 更新分类
   */
  updateCategory: async (id: number, data: { name?: string; description?: string; parentId?: number; sortOrder?: number }): Promise<SkillCategory> => {
    const response = await apiClient.put(`/admin/skill/categories/${id}`, data);
    return response.data;
  },

  /**
   * 删除分类
   */
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/skill/categories/${id}`);
  },
};
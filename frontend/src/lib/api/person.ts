import apiClient from './client';

export interface PersonProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthday?: string;
  city?: string;
  education?: string;
  school?: string;
  workYears?: number;
  currentStatus?: string;
  expectedSalary?: number;
  expectedCity?: string;
  expectedPosition?: string;
  avatar?: string;
}

export const personApi = {
  getProfile: async (userId: number): Promise<PersonProfile> => {
    const response = await apiClient.get(`/person/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: number, data: Partial<PersonProfile>): Promise<void> => {
    await apiClient.put(`/person/${userId}`, data);
  },

  getEducation: async (userId: number): Promise<any[]> => {
    const response = await apiClient.get(`/person/${userId}/education`);
    return response.data;
  },

  addEducation: async (userId: number, data: any): Promise<void> => {
    await apiClient.post(`/person/${userId}/education`, data);
  },

  getExperience: async (userId: number): Promise<any[]> => {
    const response = await apiClient.get(`/person/${userId}/experience`);
    return response.data;
  },

  addExperience: async (userId: number, data: any): Promise<void> => {
    await apiClient.post(`/person/${userId}/experience`, data);
  },
};

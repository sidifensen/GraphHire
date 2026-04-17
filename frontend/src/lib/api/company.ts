import apiClient from './client';

export interface Company {
  id: number;
  name: string;
  logo?: string;
  unifiedSocialCreditCode?: string;
  description?: string;
  website?: string;
  city?: string;
  industry?: string;
  employeeCount?: string;
  certificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface CompanyStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'HR' | 'VIEWER';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export const companyApi = {
  getInfo: async (companyId: number): Promise<Company> => {
    const response = await apiClient.get(`/company/${companyId}`);
    return response.data;
  },

  updateInfo: async (companyId: number, data: Partial<Company>): Promise<void> => {
    await apiClient.put(`/company/${companyId}`, data);
  },

  getStaffList: async (companyId: number): Promise<CompanyStaff[]> => {
    const response = await apiClient.get(`/company/${companyId}/staff`);
    return response.data;
  },

  addStaff: async (companyId: number, data: { name: string; email: string; role: string }): Promise<void> => {
    await apiClient.post(`/company/${companyId}/staff`, data);
  },

  updateStaffRole: async (staffId: number, role: string): Promise<void> => {
    await apiClient.put(`/company/staff/${staffId}/role`, { role });
  },

  disableStaff: async (staffId: number): Promise<void> => {
    await apiClient.put(`/company/staff/${staffId}/disable`);
  },
};

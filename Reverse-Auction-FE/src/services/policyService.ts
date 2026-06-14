import api from "@/utils/axios";

export interface Policy {
  id: number;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRequest {
  title: string;
  content: string;
  type: string;
}

export const getAllPolicies = async (): Promise<Policy[]> => {
  const response = await api.get("/admin/policies");
  return response.data;
};

export const getPolicyById = async (id: number): Promise<Policy> => {
  const response = await api.get(`/admin/policies/${id}`);
  return response.data;
};

export const createPolicy = async (policy: PolicyRequest): Promise<Policy> => {
  const response = await api.post("/admin/policies", policy);
  return response.data;
};

export const updatePolicy = async (id: number, policy: PolicyRequest): Promise<Policy> => {
  const response = await api.put(`/admin/policies/${id}`, policy);
  return response.data;
};

export const deletePolicy = async (id: number): Promise<void> => {
  await api.delete(`/admin/policies/${id}`);
};

// Public endpoints
export const getPublicPolicies = async (): Promise<Policy[]> => {
  const response = await api.get("/policies");
  return response.data;
};

export const getPublicPolicyById = async (id: number): Promise<Policy> => {
  const response = await api.get(`/policies/${id}`);
  return response.data;
};

export const getPublicPolicyByType = async (type: string): Promise<Policy> => {
  const response = await api.get(`/policies/type/${type}`);
  return response.data;
};

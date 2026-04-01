import api from './api';

// 1. Define the data structure matching your Java backend
export interface Experience {
  id?: number;
  designation: string;
  companyName: string;
  location: string;
  description: string;
  startDate: string; // Expected format: YYYY-MM-DD
  endDate: string | null; // We will send null if it's the current job
  isCurrentJob: boolean;
  skills: string[]; // We will send an array of skill names or IDs
}

// 2. Define the base path from your Admin Controller
const BASE_URL = '/v1/admin/experiences';

// Fetch all experiences for the dashboard
export const getExperiences = async (): Promise<Experience[]> => {
  const response = await api.get(BASE_URL);
  return response.data;
};

// Add a new experience
export const addExperience = async (data: Experience): Promise<Experience> => {
  const response = await api.post(`${BASE_URL}/add`, data);
  return response.data;
};

// Update an existing experience (We will build this in Java later!)
export const updateExperience = async (id: number, data: Experience): Promise<Experience> => {
  // Using PUT is the standard for updating full records
  const response = await api.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

// Delete an experience
export const deleteExperience = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
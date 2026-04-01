import api from './api';

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export const getAllSkills = async (): Promise<Skill[]> => {
  const response = await api.get('/v1/admin/skills');
  return response.data;
};
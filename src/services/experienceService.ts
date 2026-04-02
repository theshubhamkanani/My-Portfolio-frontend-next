import api from "./api";

export interface Experience {
  id?: number;
  designation: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrentJob: boolean;
  profileId?: number;
  skills: string[];
}

export interface PublicExperienceItem {
  id: number;
  designation: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  skills: string[];
}

const ADMIN_BASE_URL = "/admin/experiences";
const PUBLIC_BASE_URL = "/public/experiences";

const normalizeExperience = (experience: Experience): Experience => ({
  ...experience,
  endDate: experience.endDate ?? null,
  skills: experience.skills ?? [],
});

export const getAdminExperiences = async (
  profileId?: number
): Promise<Experience[]> => {
  const response = await api.get<Experience[]>(ADMIN_BASE_URL, {
    params: profileId ? { profileId } : {},
  });

  return (response.data ?? []).map(normalizeExperience);
};

export const getExperienceTimeline = async (): Promise<PublicExperienceItem[]> => {
  const response = await api.get<PublicExperienceItem[]>(PUBLIC_BASE_URL);

  return (response.data ?? []).map((experience) => ({
    ...experience,
    skills: experience.skills ?? [],
  }));
};

export const addExperience = async (data: Experience): Promise<Experience> => {
  const response = await api.post<Experience>(ADMIN_BASE_URL, data);
  return normalizeExperience(response.data);
};

export const updateExperience = async (
  id: number,
  data: Experience
): Promise<Experience> => {
  const response = await api.put<Experience>(`${ADMIN_BASE_URL}/${id}`, data);
  return normalizeExperience(response.data);
};

export const deleteExperience = async (id: number): Promise<void> => {
  await api.delete(`${ADMIN_BASE_URL}/${id}`);
};

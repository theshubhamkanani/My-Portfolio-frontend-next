import api from "./api";

export interface Education {
  id?: number;
  degreeName: string;
  instituteName: string;
  fromDate: string;
  toDate: string | null;
  shortDescription: string;
  profileId?: number;
}

const ADMIN_BASE_URL = "/admin/education";
const PUBLIC_BASE_URL = "/public/education";

const normalizeEducation = (education: Education): Education => ({
  ...education,
  toDate: education.toDate ?? null,
});

export const getAdminEducations = async (
  profileId?: number
): Promise<Education[]> => {
  const response = await api.get<Education[]>(ADMIN_BASE_URL, {
    params: profileId ? { profileId } : {},
  });

  return (response.data ?? []).map(normalizeEducation);
};

export const getPublicEducations = async (): Promise<Education[]> => {
  const response = await api.get<Education[]>(PUBLIC_BASE_URL);
  return (response.data ?? []).map(normalizeEducation);
};

export const addEducation = async (data: Education): Promise<Education> => {
  const response = await api.post<Education>(ADMIN_BASE_URL, data);
  return normalizeEducation(response.data);
};

export const updateEducation = async (
  id: number,
  data: Education
): Promise<Education> => {
  const response = await api.put<Education>(`${ADMIN_BASE_URL}/${id}`, data);
  return normalizeEducation(response.data);
};

export const deleteEducation = async (id: number): Promise<void> => {
  await api.delete(`${ADMIN_BASE_URL}/${id}`);
};

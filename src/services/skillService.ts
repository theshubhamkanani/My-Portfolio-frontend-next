import api from "./api";

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface SkillItem {
  id: number;
  name: string;
  level: number;
  categoryId?: number;
  categoryName?: string;
}

export interface SkillCategory {
  id: number;
  name: string;
  profileId?: number;
  skills?: SkillItem[];
}

export interface CreateSkillCategoryPayload {
  name: string;
  profileId?: number;
  skills: Array<{
    name: string;
    level: number;
  }>;
}

export interface CreateSkillPayload {
  name: string;
  level: number;
}

export interface UpdateSkillPayload {
  name: string;
  level: number;
  categoryId?: number;
}

const normalizeCategory = (category: SkillCategory): SkillCategory => ({
  ...category,
  skills: [...(category.skills ?? [])].sort(
    (a, b) => b.level - a.level || a.name.localeCompare(b.name)
  ),
});

export const getPublicSkillCategories = async (): Promise<SkillCategory[]> => {
  const response = await api.get<SkillCategory[]>("/public/skills");

  return (response.data ?? [])
    .map(normalizeCategory)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getAdminSkillCategories = async (
  profileId?: number
): Promise<SkillCategory[]> => {
  const response = await api.get<SkillCategory[]>("/admin/skills", {
    params: profileId ? { profileId } : {},
  });

  return (response.data ?? [])
    .map(normalizeCategory)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getSkillCategories = getPublicSkillCategories;

export const createSkillCategory = async (
  payload: CreateSkillCategoryPayload
): Promise<SkillCategory> => {
  const response = await api.post("/admin/skills/category", payload);
  const data = response.data;

  if (!data || typeof data !== "object" || Array.isArray(data) || !("name" in data)) {
    throw new Error(
      "Backend is still running the old skill-create API. Restart your Spring Boot server and try again."
    );
  }

  return normalizeCategory(data as SkillCategory);
};

export const updateSkillCategory = async (
  id: number,
  payload: { name: string; profileId?: number }
): Promise<SkillCategory> => {
  const response = await api.put<SkillCategory>(
    `/admin/skills/category/${id}`,
    payload
  );
  return normalizeCategory(response.data);
};

export const addSkillToCategory = async (
  categoryId: number,
  payload: CreateSkillPayload
): Promise<SkillItem> => {
  const response = await api.post<SkillItem>(
    `/admin/skills/category/${categoryId}/skill`,
    payload
  );
  return response.data;
};

export const updateSkill = async (
  id: number,
  payload: UpdateSkillPayload
): Promise<SkillItem> => {
  const response = await api.put<SkillItem>(`/admin/skills/${id}`, payload);
  return response.data;
};

export const deleteSkill = async (id: number): Promise<void> => {
  await api.delete(`/admin/skills/${id}`);
};

export const deleteSkillCategory = async (id: number): Promise<void> => {
  await api.delete(`/admin/skills/category/${id}`);
};

export const getAllSkills = async (profileId?: number): Promise<Skill[]> => {
  const categories = await getAdminSkillCategories(profileId);

  return categories.flatMap((category) =>
    (category.skills ?? []).map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: category.name,
    }))
  );
};

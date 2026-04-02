import api from "./api";

export interface Project {
  id?: number;
  projectName: string;
  organizationName: string;
  designation: string;
  description: string;
  githubLink?: string | null;
  liveLink?: string | null;
  startDate: string;
  endDate: string | null;
  isCurrentProject: boolean;
  profileId?: number;
  skills: string[];
}

export interface PublicProjectItem {
  id: number;
  projectName: string;
  organizationName: string;
  designation: string;
  description: string;
  githubLink?: string | null;
  liveLink?: string | null;
  startDate: string;
  endDate: string;
  isCurrentProject: boolean;
  skills: string[];
}

const ADMIN_BASE_URL = "/admin/projects";
const PUBLIC_BASE_URL = "/public/projects";

const normalizeProject = (project: Project): Project => ({
  ...project,
  githubLink: project.githubLink ?? null,
  liveLink: project.liveLink ?? null,
  endDate: project.endDate ?? null,
  skills: project.skills ?? [],
});

export const getAdminProjects = async (
  profileId?: number
): Promise<Project[]> => {
  const response = await api.get<Project[]>(ADMIN_BASE_URL, {
    params: profileId ? { profileId } : {},
  });

  return (response.data ?? []).map(normalizeProject);
};

export const getProjectShowcase = async (): Promise<PublicProjectItem[]> => {
  const response = await api.get<PublicProjectItem[]>(PUBLIC_BASE_URL);

  return (response.data ?? []).map((project) => ({
    ...project,
    githubLink: project.githubLink ?? null,
    liveLink: project.liveLink ?? null,
    skills: project.skills ?? [],
  }));
};

export const addProject = async (data: Project): Promise<Project> => {
  const response = await api.post<Project>(ADMIN_BASE_URL, data);
  return normalizeProject(response.data);
};

export const updateProject = async (
  id: number,
  data: Project
): Promise<Project> => {
  const response = await api.put<Project>(`${ADMIN_BASE_URL}/${id}`, data);
  return normalizeProject(response.data);
};

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`${ADMIN_BASE_URL}/${id}`);
};

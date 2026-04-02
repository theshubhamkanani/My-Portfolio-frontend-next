import api from "./api";

export interface HighlightItem {
  id?: number;
  text: string;
  profileId: number;
}

export interface AdminProfile {
  id?: number;
  fullName: string;
  profilePhotoUrl?: string | null;
  titleLine: string;
  githubLink: string;
  linkedinLink: string;
  email: string;
  live?: boolean;
  heroHeadline?: string | null;
  heroDescription?: string | null;
  aboutHeadline?: string | null;
  aboutDescription?: string | null;
  highlights?: HighlightItem[];
}

export interface AboutItemPayload {
  id?: number;
  text: string;
  type?: string;
  live?: boolean;
  profileId: number;
}

export interface HeadlineItem extends AboutItemPayload {
  type: string;
  live: boolean;
}

export interface DescriptionItem extends AboutItemPayload {
  type: string;
  live: boolean;
}

const normalizeProfile = (
  profile?: Partial<AdminProfile> | null
): AdminProfile => ({
  id: profile?.id,
  fullName: profile?.fullName ?? "",
  profilePhotoUrl: profile?.profilePhotoUrl ?? null,
  titleLine: profile?.titleLine ?? "",
  githubLink: profile?.githubLink ?? "",
  linkedinLink: profile?.linkedinLink ?? "",
  email: profile?.email ?? "",
  live: Boolean(profile?.live),
  heroHeadline: profile?.heroHeadline ?? null,
  heroDescription: profile?.heroDescription ?? null,
  aboutHeadline: profile?.aboutHeadline ?? null,
  aboutDescription: profile?.aboutDescription ?? null,
  highlights: profile?.highlights ?? [],
});

const normalizeHeadline = (
  item?: Partial<HeadlineItem> | null
): HeadlineItem => ({
  id: item?.id,
  text: item?.text ?? "",
  type: item?.type ?? "HERO",
  live: Boolean(item?.live),
  profileId: Number(item?.profileId ?? 0),
});

const normalizeDescription = (
  item?: Partial<DescriptionItem> | null
): DescriptionItem => ({
  id: item?.id,
  text: item?.text ?? "",
  type: item?.type ?? "ABOUT",
  live: Boolean(item?.live),
  profileId: Number(item?.profileId ?? 0),
});

export const getAdminProfile = async (
  profileId?: number
): Promise<AdminProfile> => {
  const response = await api.get<AdminProfile>("/admin/profile", {
    params: profileId ? { profileId } : {},
  });

  return normalizeProfile(response.data);
};

export const createAdminProfile = async (
  payload: AdminProfile
): Promise<AdminProfile> => {
  const response = await api.post<AdminProfile>("/admin/profiles", payload);
  return normalizeProfile(response.data);
};

export const updateAdminProfile = async (
  payload: AdminProfile
): Promise<AdminProfile> => {
  const url = payload.id ? `/admin/profiles/${payload.id}` : "/admin/profile";
  const response = await api.put<AdminProfile>(url, payload);
  return normalizeProfile(response.data);
};

export const getHeadlines = async (
  profileId?: number
): Promise<HeadlineItem[]> => {
  const response = await api.get<HeadlineItem[]>("/admin/headlines", {
    params: profileId ? { profileId } : {},
  });

  return (response.data ?? []).map(normalizeHeadline);
};

export const createHeadline = async (
  payload: AboutItemPayload
): Promise<HeadlineItem> => {
  const response = await api.post<HeadlineItem>("/admin/headlines", payload);
  return normalizeHeadline(response.data);
};

export const updateHeadline = async (
  id: number,
  payload: AboutItemPayload
): Promise<HeadlineItem> => {
  const response = await api.put<HeadlineItem>(`/admin/headlines/${id}`, payload);
  return normalizeHeadline(response.data);
};

export const activateHeadline = async (id: number): Promise<HeadlineItem> => {
  const response = await api.patch<HeadlineItem>(`/admin/headlines/${id}/live`);
  return normalizeHeadline(response.data);
};

export const deleteHeadline = async (id: number): Promise<void> => {
  await api.delete(`/admin/headlines/${id}`);
};

export const getDescriptions = async (
  profileId?: number
): Promise<DescriptionItem[]> => {
  const response = await api.get<DescriptionItem[]>("/admin/descriptions", {
    params: profileId ? { profileId } : {},
  });

  return (response.data ?? []).map(normalizeDescription);
};

export const createDescription = async (
  payload: AboutItemPayload
): Promise<DescriptionItem> => {
  const response = await api.post<DescriptionItem>("/admin/descriptions", payload);
  return normalizeDescription(response.data);
};

export const updateDescription = async (
  id: number,
  payload: AboutItemPayload
): Promise<DescriptionItem> => {
  const response = await api.put<DescriptionItem>(
    `/admin/descriptions/${id}`,
    payload
  );
  return normalizeDescription(response.data);
};

export const activateDescription = async (
  id: number
): Promise<DescriptionItem> => {
  const response = await api.patch<DescriptionItem>(
    `/admin/descriptions/${id}/live`
  );
  return normalizeDescription(response.data);
};

export const deleteDescription = async (id: number): Promise<void> => {
  await api.delete(`/admin/descriptions/${id}`);
};

export const getHighlights = async (
  profileId?: number
): Promise<HighlightItem[]> => {
  const response = await api.get<HighlightItem[]>("/admin/highlights", {
    params: profileId ? { profileId } : {},
  });

  return (response.data ?? []).map((item) => ({
    id: item.id,
    text: item.text ?? "",
    profileId: item.profileId ?? 0,
  }));
};

export const createHighlight = async (
  payload: AboutItemPayload
): Promise<HighlightItem> => {
  const response = await api.post<HighlightItem>("/admin/highlights", payload);
  return response.data;
};

export const updateHighlight = async (
  id: number,
  payload: AboutItemPayload
): Promise<HighlightItem> => {
  const response = await api.put<HighlightItem>(
    `/admin/highlights/${id}`,
    payload
  );
  return response.data;
};

export const deleteHighlight = async (id: number): Promise<void> => {
  await api.delete(`/admin/highlights/${id}`);
};

import api from "./api";

export interface AdminProfileSummary {
  id: number;
  fullName: string;
  titleLine: string;
  email?: string;
  profilePhotoUrl?: string | null;
  githubLink?: string;
  linkedinLink?: string;
  live: boolean;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
}

const normalizeProfile = (
  profile?: Partial<AdminProfileSummary> | null
): AdminProfileSummary => ({
  id: Number(profile?.id ?? 0),
  fullName: profile?.fullName ?? "",
  titleLine: profile?.titleLine ?? "",
  email: profile?.email ?? "",
  profilePhotoUrl: profile?.profilePhotoUrl ?? null,
  githubLink: profile?.githubLink ?? "",
  linkedinLink: profile?.linkedinLink ?? "",
  live: Boolean(profile?.live),
});

export const getAdminProfiles = async (): Promise<AdminProfileSummary[]> => {
  const response = await api.get<AdminProfileSummary[]>("/admin/profiles");

  return (response.data ?? [])
    .map(normalizeProfile)
    .filter((profile) => profile.id > 0)
    .sort((a, b) => {
      if (a.live !== b.live) return a.live ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });
};

export const activateProfile = async (
  profileId: number
): Promise<AdminProfileSummary> => {
  const response = await api.patch<AdminProfileSummary>(
    `/admin/profiles/${profileId}/live`
  );

  return normalizeProfile(response.data);
};

export const uploadProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<FileUploadResponse>(
    "/admin/uploads/profile-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.fileUrl;
};

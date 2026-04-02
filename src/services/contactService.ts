import api from "./api";

export interface ContactRequestPayload {
  name: string;
  email: string;
  reason: string;
  description: string;
  website?: string;
}


export interface ContactRequest extends ContactRequestPayload {
  id: number;
  createdAt: string;
}

export const submitContactRequest = async (
  payload: ContactRequestPayload
): Promise<string> => {
  const response = await api.post<string>("/public/contact", payload);
  return typeof response.data === "string"
    ? response.data
    : "Message sent successfully.";
};

export const getAdminContactRequests = async (
  search = ""
): Promise<ContactRequest[]> => {
  const response = await api.get<ContactRequest[]>("/admin/contact", {
    params: search.trim() ? { search: search.trim() } : {},
  });

  return response.data ?? [];
};

import api from "./api";
import { clearAdminTabToken, setAdminTabToken } from "./adminTabSession";

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  tabToken: string | null;
}

export const loginUser = async (credentials: LoginRequest): Promise<void> => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", credentials);

    if (!response.data.tabToken) {
      throw new Error("Missing tab token.");
    }

    setAdminTabToken(response.data.tabToken);
  } catch (error) {
    clearAdminTabToken();
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAdminTabToken();
    window.location.href = "/shubh-dev";
  }
};

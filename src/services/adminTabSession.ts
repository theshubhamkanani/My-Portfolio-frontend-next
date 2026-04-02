const ADMIN_TAB_TOKEN_KEY = "portfolio_admin_tab_token";

export const getAdminTabToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(ADMIN_TAB_TOKEN_KEY);
};

export const setAdminTabToken = (token: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(ADMIN_TAB_TOKEN_KEY, token);
};

export const clearAdminTabToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(ADMIN_TAB_TOKEN_KEY);
};

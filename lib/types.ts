export type UserRole = "admin" | "analyst" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  logo_url: string | null;
  theme_config: ThemeConfig | null;
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
}

export interface UserWorkspace {
  user_id: string;
  workspace_id: string;
  role: UserRole;
  workspace: Workspace;
}

export interface User {
  id: string;
  email: string;
  name: string;
  auth0_id: string;
  created_at: string;
}

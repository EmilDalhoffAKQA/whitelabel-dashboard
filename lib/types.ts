export type UserRole = "superadmin" | "admin" | "editor";
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

// Widget System Types
export interface WidgetType {
  id: string;
  name: string;
  display_name: string;
  category: string;
  component_name: string;
  workspace_id: number | null;
  width: number;
  height: number;
  sort_order: number;
  is_active: boolean;
}

export interface WorkspaceWidgetLayout {
  id: string;
  workspace_id: number;
  widget_type_id: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  widget_type?: WidgetType;
}

export interface WidgetType {
  id: string;
  name: string;
  display_name: string;
  category: string;
  component_name: string;
  width: number;
  height: number;
  sort_order: number;
  is_active: boolean;
}

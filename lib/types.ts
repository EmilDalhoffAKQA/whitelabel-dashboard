export interface Workspace {
  id: number;
  name: string;
  logo_url: string | null;
  auth0_org_id: string;
  parent_workspace_id: number | null;
  theme_config: {
    primaryColor: string;
    logo: string;
  } | null;
}

export interface UserWorkspace {
  user_id: number;
  workspace_id: number;
  role: "admin" | "editor" | "viewer";
  workspace: Workspace;
}

import { supabaseAdmin } from "./supabase";

export async function getWorkspaceByIdentifier(identifier: string) {
  const { data, error } = await supabaseAdmin
    .from("workspaces")
    .select("*")
    .eq("name", identifier)
    .single();

  if (error || !data) {
    throw new Error("Workspace not found: " + identifier);
  }

  if (!data.auth0_org_id) {
    throw new Error("Workspace does not have Auth0 organization configured");
  }

  return data;
}

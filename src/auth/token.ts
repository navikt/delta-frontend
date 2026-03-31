import type { User } from "@/types/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { exchangeForOboToken, introspectToken } from "./texas";

// Cached per render — reads the Authorization header once and introspects the token
const getClaims = cache(async (): Promise<Record<string, unknown> | null> => {
  if (process.env.NODE_ENV === "development") return null;

  const authHeader = (await headers()).get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  return introspectToken(token);
});

// Deduplicate user lookups within a single server render
export const getUser = cache(async (): Promise<User> => {
  if (process.env.NODE_ENV === "development") {
    return {
      firstName: "Ola Kari",
      lastName: "Nordmann",
      email: "dev@localhost",
    };
  }

  const claims = await getClaims();
  if (!claims) redirect("/oauth2/login");

  const [lastName, firstName] = (claims.name as string).split(", ");
  const email = (claims.preferred_username as string).toLowerCase();

  return { firstName, lastName, email };
});

async function getAccessToken(scope: string): Promise<string | null> {
  if (process.env.NODE_ENV === "development") return null;

  const authHeader = (await headers()).get("Authorization");
  if (!authHeader) throw new Error("No access token, please log in...");

  const userToken = authHeader.replace("Bearer ", "");
  return exchangeForOboToken(userToken, scope);
}

// Deduplicate OBO token requests within a single server render
export const getDeltaBackendAccessToken = cache(
  async (): Promise<string | null> => {
    return process.env.NEXT_PUBLIC_CLUSTER === "prod"
      ? await getAccessToken("api://prod-gcp.delta.delta-backend/.default")
      : await getAccessToken("api://dev-gcp.delta.delta-backend/.default");
  },
);

export async function getUserGroups(): Promise<string[]> {
  if (process.env.NODE_ENV === "development") return [];

  const claims = await getClaims();
  if (!claims) return [];

  return Array.isArray(claims.groups) ? (claims.groups as string[]) : [];
}

export async function isFaggruppeAdmin(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;

  const adminGroupId = process.env.FAGGRUPPE_ADMIN_GROUP_ID;
  if (!adminGroupId) return false;

  const groups = await getUserGroups();
  return groups.includes(adminGroupId);
}


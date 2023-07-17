import {
  validateAzureToken,
  grantAzureOboToken,
} from "@navikt/next-auth-wonderwall";
import type { User } from "@/types/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function checkToken() {
  if (process.env.NODE_ENV === "development") return;

  const authHeader = headers().get("Authorization");
  if (!authHeader) {
    redirect("/oauth2/login");
  }

  const result = await validateAzureToken(authHeader);
  if (result !== "valid") {
    console.log(`Tokenvalidering gikk galt: ${result.message}`);
    redirect("/oauth2/login");
  }
}

export function getUser(): User {
  if (process.env.NODE_ENV === "development") {
    return {
      firstName: "Ola",
      lastName: "Nordmann",
      email: "dev@localhost",
    };
  }

  const authHeader = headers().get("Authorization");
  if (!authHeader) {
    redirect("/oauth2/login");
  }

  const token = authHeader.replace("Bearer ", "");
  const jwtPayload = token.split(".")[1];
  const payload = JSON.parse(Buffer.from(jwtPayload, "base64").toString());

  const [lastName, firstName] = payload.name.split(", ");
  const email = payload.preferred_username.toLowerCase();

  return {
    firstName,
    lastName,
    email,
  };
}

export async function getAccessToken(
  scope: string = "",
): Promise<string | null> {
  if (process.env.NODE_ENV === "development") return null;

  const authHeader = headers().get("Authorization");
  if (!authHeader) {
    redirect("/oauth2/login");
  }

  console.log("Before obo token");
  const result = await grantAzureOboToken(
    authHeader.replace("Bearer ", ""),
    scope,
  );

  console.log("After obo token");
  if (typeof result !== "string") {
    console.log(`Grant azure obo token failed: ${result.message}`);
    return null;
  }

  return result;
}

export async function getDeltaBackendAccessToken(): Promise<string | null> {
  return await getAccessToken("api://dev-gcp.delta.delta-backend/.default");
}

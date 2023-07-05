import { validateAzureToken } from "@navikt/next-auth-wonderwall";
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

export type User = {
  firstName: string;
  lastName: string;
  email: string;
};

export function getUser(): User {
  if (process.env.NODE_ENV === "development") {
    return {
      firstName: "Ola",
      lastName: "Nordmann",
      email: "ola.nordmann@nav.no",
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
  const email = payload.preferred_username.toLowerCase()

  return {
    firstName,
    lastName,
    email,
  };
}
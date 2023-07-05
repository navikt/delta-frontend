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

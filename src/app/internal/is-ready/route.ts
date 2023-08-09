import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    response:
      "I will follow all your orders; now you have manual hibernation control.",
  });
}

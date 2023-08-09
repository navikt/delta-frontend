import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    response:
      "I honestly think you ought to sit down calmly, take a stress pill, and think things over.",
  });
}

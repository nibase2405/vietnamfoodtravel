import { NextResponse } from "next/server";
import { getUserDashboardStatsData } from "@/lib/data/dashboard";

export async function GET() {
  return NextResponse.json(await getUserDashboardStatsData());
}

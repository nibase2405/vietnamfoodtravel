import { NextResponse } from "next/server";
import { getMerchantDashboardData } from "@/lib/data/dashboard";
import { requireApiRole } from "@/lib/api/guards";

export async function GET() {
  const { response } = await requireApiRole(["merchant", "admin", "super_admin"]);
  if (response) return response;
  return NextResponse.json(await getMerchantDashboardData());
}

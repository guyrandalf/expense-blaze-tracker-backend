import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (req: Request, userId: string) => {
  try {
    const url = new URL(req.url);
    const year = Number(url.searchParams.get("year"));
    const month = Number(url.searchParams.get("month"));
    if (!year || !month) {
      return NextResponse.json({ error: "Year and month are required" }, { status: 400 });
    }
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      include: {
        items: true,
      },
    });
    return NextResponse.json(budget);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 }
    );
  }
}); 
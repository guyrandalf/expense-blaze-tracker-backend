import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (req: Request, userId: string) => {
  try {
    const url = new URL(req.url);
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));
    if (!month || !year) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 }
      );
    }
    // Get budget
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });
    // Get total expenses for the month
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    return NextResponse.json({
      budget,
      totalExpenses,
      difference: budget ? (budget.expectedIncome ?? 0) - totalExpenses : null,
    });
  } catch (error) {
    console.error("Error fetching budget analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget analysis" },
      { status: 500 }
    );
  }
}); 
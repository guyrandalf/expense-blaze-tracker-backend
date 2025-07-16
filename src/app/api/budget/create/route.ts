import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = withAuth(async (req: Request, userId: string) => {
  try {
    const { month, year, expectedIncome, items } = await req.json();
    if (!month || !year) {
      return NextResponse.json(
        { error: "Valid month and year are required" },
        { status: 400 }
      );
    }
    // Upsert budget
    const budget = await prisma.budget.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: {
        expectedIncome: expectedIncome !== undefined ? Number(expectedIncome) : undefined,
      },
      create: {
        userId,
        month,
        year,
        expectedIncome: expectedIncome !== undefined ? Number(expectedIncome) : undefined,
      },
    });
    // If items are provided, upsert them
    if (Array.isArray(items)) {
      // Delete old items for this budget
      await prisma.budgetItem.deleteMany({ where: { budgetId: budget.id } });
      // Create new items
      for (const item of items) {
        await prisma.budgetItem.create({
          data: {
            budgetId: budget.id,
            category: item.category,
            estimatedAmount: Number(item.estimatedAmount),
          },
        });
      }
    }
    // Return updated budget with items
    const updatedBudget = await prisma.budget.findUnique({
      where: { id: budget.id },
      include: { items: true },
    });
    return NextResponse.json(updatedBudget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}); 
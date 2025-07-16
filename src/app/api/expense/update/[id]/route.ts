import {NextResponse} from "next/server"
import {withAuth} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export const PUT = withAuth(async (req: Request, userId: string) => {
  try {
    const { amount, name, isRecurring, expenseDate, recurrenceInterval, startDate, endDate } = await req.json()

    // Get the expense ID from the URL
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      )
    }

    // Validate input
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    // Check if the expense exists and belongs to the user
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      )
    }

    if (existingExpense.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Optionally mark as fully reimbursed
    if (req.method === "PUT") {
      const body = await req.json();
      if (body.markReimbursed) {
        await prisma.reimbursement.updateMany({
          where: { expenseId: id },
          data: { status: "complete" },
        });
      }
    }

    // Update expense record
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount: Number(amount),
        name: name || null,
        isRecurring: Boolean(isRecurring),
        expenseDate: expenseDate ? new Date(expenseDate) : undefined,
        recurrenceInterval: recurrenceInterval || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    )
  }
})

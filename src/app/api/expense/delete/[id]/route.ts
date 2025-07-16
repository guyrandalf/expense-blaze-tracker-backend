import {NextResponse} from "next/server"
import {withAuth} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export const DELETE = withAuth(async (req: Request, userId: string) => {
  try {
    // Get the expense ID from the URL
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
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

    // Check for reimbursements
    const reimbursementCount = await prisma.reimbursement.count({ where: { expenseId: id } });
    if (reimbursementCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete expense with reimbursements. Delete reimbursements first." },
        { status: 400 }
      );
    }

    // Delete expense record
    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    )
  }
})

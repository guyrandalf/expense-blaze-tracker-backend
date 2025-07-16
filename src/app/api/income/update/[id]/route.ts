import {NextResponse} from "next/server"
import {withAuth} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export const PUT = withAuth(async (req: Request, userId: string) => {
  try {
    const { amount, source, isRecurring } = await req.json()

    // Get the income ID from the URL
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: "Income ID is required" },
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

    // Check if the income exists and belongs to the user
    const existingIncome = await prisma.income.findUnique({
      where: { id },
    })

    if (!existingIncome) {
      return NextResponse.json(
        { error: "Income not found" },
        { status: 404 }
      )
    }

    if (existingIncome.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Update income record
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        amount: Number(amount),
        source: source || null,
        isRecurring: Boolean(isRecurring),
      },
    })

    return NextResponse.json(updatedIncome)
  } catch (error) {
    console.error("Error updating income:", error)
    return NextResponse.json(
      { error: "Failed to update income" },
      { status: 500 }
    )
  }
})

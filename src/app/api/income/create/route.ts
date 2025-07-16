import {NextResponse} from "next/server"
import {withAuth} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export const POST = withAuth(async (req: Request, userId: string) => {
  try {
    const { amount, source, isRecurring } = await req.json()

    // Validate input
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    // Create income record
    const income = await prisma.income.create({
      data: {
        userId,
        amount: Number(amount),
        source: source || null,
        isRecurring: Boolean(isRecurring),
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error("Error creating income:", error)
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    )
  }
})

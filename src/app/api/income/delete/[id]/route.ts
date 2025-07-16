import {NextResponse} from "next/server"
import {withAuth} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export const DELETE = withAuth(async (req: Request, userId: string) => {
  try {
    // Get the income ID from the URL
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: "Income ID is required" },
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

    // Delete income record
    await prisma.income.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting income:", error)
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    )
  }
})

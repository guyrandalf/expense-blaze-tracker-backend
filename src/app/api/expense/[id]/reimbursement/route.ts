import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all reimbursements for an expense
export const GET = withAuth(async (req: Request, userId: string) => {
  const url = new URL(req.url);
  const expenseId = url.pathname.split("/").filter(Boolean).at(-2); // /expense/[id]/reimbursement
  if (!expenseId) {
    return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
  }
  // Check ownership
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.userId !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }
  const reimbursements = await prisma.reimbursement.findMany({
    where: { expenseId },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(reimbursements);
});

// POST: Create a new reimbursement for an expense
export const POST = withAuth(async (req: Request, userId: string) => {
  const url = new URL(req.url);
  const expenseId = url.pathname.split("/").filter(Boolean).at(-2);
  if (!expenseId) {
    return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
  }
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.userId !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }
  const { amount, date, note, status } = await req.json();
  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }
  const reimbursement = await prisma.reimbursement.create({
    data: {
      expenseId,
      amount: Number(amount),
      date: new Date(date),
      note: note || null,
      status: status || "partial",
    },
  });
  return NextResponse.json(reimbursement, { status: 201 });
}); 
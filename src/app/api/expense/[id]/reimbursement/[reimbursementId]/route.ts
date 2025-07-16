import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT: Update a reimbursement
export const PUT = withAuth(async (req: Request, userId: string) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const expenseId = pathParts.at(-3);
  const reimbursementId = pathParts.at(-1);
  if (!expenseId || !reimbursementId) {
    return NextResponse.json({ error: "Expense ID and Reimbursement ID are required" }, { status: 400 });
  }
  // Check ownership
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.userId !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }
  const { amount, date, note, status } = await req.json();
  const reimbursement = await prisma.reimbursement.update({
    where: { id: reimbursementId },
    data: {
      amount: amount !== undefined ? Number(amount) : undefined,
      date: date ? new Date(date) : undefined,
      note: note !== undefined ? note : undefined,
      status: status || undefined,
    },
  });
  return NextResponse.json(reimbursement);
});

// DELETE: Remove a reimbursement
export const DELETE = withAuth(async (req: Request, userId: string) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const expenseId = pathParts.at(-3);
  const reimbursementId = pathParts.at(-1);
  if (!expenseId || !reimbursementId) {
    return NextResponse.json({ error: "Expense ID and Reimbursement ID are required" }, { status: 400 });
  }
  // Check ownership
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.userId !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }
  await prisma.reimbursement.delete({ where: { id: reimbursementId } });
  return NextResponse.json({ success: true });
}); 
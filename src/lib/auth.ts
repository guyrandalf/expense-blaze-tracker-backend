import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set")
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null
  }
}

export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.split(" ")[1]
}

export function withAuth(
  handler: (req: Request, userId: string) => Promise<Response>
) {
  return async (req: Request) => {
    const token = getAuthToken(req)
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return handler(req, payload.userId)
  }
}

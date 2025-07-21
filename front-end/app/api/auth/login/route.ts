import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Mock authentication - replace with actual Ballerina service
    if (email && password) {
      const user = {
        id: "1",
        name: "Dinil Hansara",
        email: email,
        avatar: "/placeholder-user.jpg",
      }

      return NextResponse.json(user)
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

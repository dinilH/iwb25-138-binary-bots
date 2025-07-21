import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Mock signup - replace with actual Ballerina service
    if (name && email && password) {
      const user = {
        id: Date.now().toString(),
        name: name,
        email: email,
        avatar: "/placeholder-user.jpg",
      }

      return NextResponse.json(user)
    }

    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

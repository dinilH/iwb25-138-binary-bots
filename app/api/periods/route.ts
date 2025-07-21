import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const periodData = await request.json()

    // Mock period data storage - replace with actual Ballerina service
    const savedPeriod = {
      id: Date.now().toString(),
      ...periodData,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(savedPeriod)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

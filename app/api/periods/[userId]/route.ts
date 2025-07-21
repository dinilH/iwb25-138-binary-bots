import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Mock period history - replace with actual Ballerina service
    const mockPeriods = [
      {
        id: "1",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-01-15"),
        flow: "normal",
        symptoms: ["cramps", "bloating"],
        cycleLength: 28,
      },
      {
        id: "2",
        startDate: new Date("2023-12-13"),
        endDate: new Date("2023-12-18"),
        flow: "heavy",
        symptoms: ["headache", "mood swings"],
        cycleLength: 28,
      },
    ]

    const analytics = {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      nextPredictedDate: new Date("2024-02-07"),
      irregularityScore: 15,
    }

    return NextResponse.json({ periods: mockPeriods, analytics })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

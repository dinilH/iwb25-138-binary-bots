import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('asgardeo_user')
    const tokenCookie = request.cookies.get('asgardeo_access_token')

    if (!userCookie || !tokenCookie) {
      return NextResponse.json({ user: null, isAuthenticated: false })
    }

    const user = JSON.parse(userCookie.value)
    
    return NextResponse.json({ 
      user: {
        id: user.sub || "unknown",
        email: user.email || "",
        name: user.name || user.given_name || "User",
        firstName: user.given_name,
        lastName: user.family_name,
        avatar: user.picture || "/placeholder-user.jpg",
        isEmailVerified: user.email_verified || false
      }, 
      isAuthenticated: true 
    })

  } catch (error) {
    console.error('Error getting user session:', error)
    return NextResponse.json({ user: null, isAuthenticated: false })
  }
}

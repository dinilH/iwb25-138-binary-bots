import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }

  if (!code) {
    console.error('No authorization code received')
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID}:${process.env.ASGARDEO_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
    }

    const tokens = await tokenResponse.json()
    console.log('Token exchange successful')

    // Get user info
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL}/oauth2/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!userResponse.ok) {
      console.error('User info fetch failed')
      return NextResponse.redirect(new URL('/?error=userinfo_failed', request.url))
    }

    const userInfo = await userResponse.json()
    console.log('User info retrieved successfully')

    // Create a simple session - in production, use proper session management
    const response = NextResponse.redirect(new URL('/auth/success', request.url))
    
    // Set httpOnly cookies for security
    response.cookies.set('asgardeo_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600
    })

    if (tokens.refresh_token) {
      response.cookies.set('asgardeo_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 30 // 30 days
      })
    }
    
    response.cookies.set('asgardeo_user', JSON.stringify(userInfo), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600
    })

    return response

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=callback_error', request.url))
  }
}

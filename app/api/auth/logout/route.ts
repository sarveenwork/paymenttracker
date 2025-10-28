import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' })
    
    // Clear the session cookie
    response.cookies.set('admin-session', '', {
      path: '/',
      expires: new Date(0),
      secure: true,
      sameSite: 'strict'
    })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

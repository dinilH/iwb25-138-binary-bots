import { NextRequest, NextResponse } from 'next/server';

// In-memory bookmark storage (in production, use a database)
let bookmarkedArticles: { [key: string]: boolean } = {};

// GET /api/news/bookmarks - Get all bookmarked articles
export async function GET() {
  const bookmarkedIds = Object.keys(bookmarkedArticles);
  return NextResponse.json({
    success: true,
    bookmarkedArticles: bookmarkedIds
  });
}

// POST /api/news/bookmarks - Add bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json(
        { success: false, message: 'Article ID is required' },
        { status: 400 }
      );
    }

    bookmarkedArticles[articleId] = true;

    return NextResponse.json({
      success: true,
      message: 'Article bookmarked successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to bookmark article' },
      { status: 500 }
    );
  }
}

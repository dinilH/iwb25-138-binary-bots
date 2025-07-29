import { NextRequest, NextResponse } from 'next/server';

// In-memory bookmark storage (should match the one in route.ts)
let bookmarkedArticles: { [key: string]: boolean } = {};

// DELETE /api/news/bookmarks/[articleId] - Remove bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const { articleId } = params;

    if (!articleId) {
      return NextResponse.json(
        { success: false, message: 'Article ID is required' },
        { status: 400 }
      );
    }

    if (bookmarkedArticles[articleId]) {
      delete bookmarkedArticles[articleId];
    }

    return NextResponse.json({
      success: true,
      message: 'Article unbookmarked successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to unbookmark article' },
      { status: 500 }
    );
  }
}

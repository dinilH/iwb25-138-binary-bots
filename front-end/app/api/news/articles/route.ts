import { NextRequest, NextResponse } from 'next/server';

// Secure API key management using environment variables
const API_KEY = process.env.NEWS_API_KEY;

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  newsSource: string;
  category: string;
  isBookmarked?: boolean;
}

// Advanced categorization function
function categorizeArticle(title: string, description: string): string {
  const content = (title + " " + description).toLowerCase();
  
  const categoryKeywords = {
    "Mental Health": ["mental", "depression", "anxiety", "stress", "therapy", "wellbeing"],
    "Nutrition": ["nutrition", "diet", "food", "vitamin", "supplement", "eating"],
    "Fitness": ["exercise", "fitness", "workout", "yoga", "training", "physical"],
    "Pregnancy": ["pregnancy", "pregnant", "maternal", "prenatal", "baby", "birth"],
    "Menopause": ["menopause", "perimenopause", "hot flashes", "hormone"],
    "Research": ["research", "study", "clinical trial", "scientific", "findings"],
    "Reproductive Health": ["reproductive", "fertility", "pcos", "endometriosis", "ovarian"]
  };

  let bestCategory = "Women's Health";
  let highestScore = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        score += keyword.length > 8 ? 3 : keyword.length > 5 ? 2 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }

  return highestScore < 2 ? "Women's Health" : bestCategory;
}

export async function GET(request: NextRequest) {
  try {
    // Check if API key is available
    if (!API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'News API key not configured',
          articles: [] 
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Build NewsAPI query
    let baseQuery = "(women+health+OR+breast+cancer+OR+reproductive+health+OR+maternal+health+OR+gynecology+OR+fertility+OR+period+OR+menstruation+OR+PCOS+OR+endometriosis+OR+menopause)";
    
    if (search && search.trim()) {
      baseQuery += `+AND+${encodeURIComponent(search.trim())}`;
    }

    const newsApiUrl = `https://newsapi.org/v2/everything?q=${baseQuery}&sortBy=publishedAt&pageSize=${pageSize}&page=${page}&language=en&sources=medical-news-today,healthline,npr,cnn,bbc-news,the-guardian,reuters,associated-press`;

    const response = await fetch(newsApiUrl, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform and categorize articles
    const transformedArticles: NewsArticle[] = data.articles?.map((article: any, index: number) => {
      const assignedCategory = categorizeArticle(article.title || "", article.description || "");
      
      // Filter by category if specified
      if (category && category !== "All" && assignedCategory !== category) {
        return null;
      }

      return {
        id: `news_${index}`,
        title: article.title || "",
        description: article.description || "",
        url: article.url || "",
        imageUrl: article.urlToImage || "/placeholder.svg",
        publishedAt: article.publishedAt || "",
        newsSource: article.source?.name || "Unknown Source",
        category: assignedCategory,
        isBookmarked: false
      };
    }).filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      articles: transformedArticles,
      totalResults: data.totalResults || 0
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch news',
        articles: [] 
      },
      { status: 500 }
    );
  }
}

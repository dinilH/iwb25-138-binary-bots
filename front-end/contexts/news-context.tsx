"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string
  publishedAt: string
  newsSource: string
  category: string
  isBookmarked?: boolean
}

interface NewsContextType {
  articles: NewsArticle[]
  filteredArticles: NewsArticle[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string
  bookmarkedArticles: string[]
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  fetchNews: (category?: string, search?: string) => Promise<void>
  toggleBookmark: (articleId: string) => Promise<void>
  refreshNews: () => Promise<void>
}

// API configuration
// Dynamic API URL based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/news'

const NewsContext = createContext<NewsContextType | undefined>(undefined)

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([])

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedArticles")
    if (savedBookmarks) {
      setBookmarkedArticles(JSON.parse(savedBookmarks))
    }
  }, [])

  // Initial news fetch
  useEffect(() => {
    fetchNews()
  }, [])

  // Filter articles when search or category changes
  useEffect(() => {
    let filtered = articles

    if (selectedCategory !== "All") {
      filtered = filtered.filter((article) => article.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredArticles(filtered)
  }, [articles, selectedCategory, searchQuery])

  const fetchNews = async (category?: string, search?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (category && category !== "All") {
        params.append('category', category)
      }
      if (search && search.trim()) {
        params.append('search', search.trim())
      }
      
      const url = `${API_BASE_URL}/articles${params.toString() ? '?' + params.toString() : ''}`
      console.log('Fetching news from:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        // Update articles with bookmark status
        const articlesWithBookmarks = (data.articles || []).map((article: NewsArticle) => ({
          ...article,
          isBookmarked: bookmarkedArticles.includes(article.id)
        }))
        
        setArticles(articlesWithBookmarks)
        setFilteredArticles(articlesWithBookmarks)
      } else {
        setError(data.message || 'Failed to fetch news')
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem("cached-news")
        if (stored) {
          const cachedArticles = JSON.parse(stored)
          setArticles(cachedArticles)
          setFilteredArticles(cachedArticles)
        }
      }
    } catch (err) {
      console.error('Failed to fetch news:', err)
      setError('Failed to connect to news service')
      
      // Fallback to localStorage
      const stored = localStorage.getItem("cached-news")
      if (stored) {
        const cachedArticles = JSON.parse(stored)
        setArticles(cachedArticles)
        setFilteredArticles(cachedArticles)
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (articleId: string) => {
    try {
      const isCurrentlyBookmarked = bookmarkedArticles.includes(articleId)
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        await fetch(`${API_BASE_URL}/bookmarks/${articleId}`, {
          method: 'DELETE'
        })
        
        const newBookmarks = bookmarkedArticles.filter(id => id !== articleId)
        setBookmarkedArticles(newBookmarks)
        localStorage.setItem("bookmarkedArticles", JSON.stringify(newBookmarks))
      } else {
        // Add bookmark
        await fetch(`${API_BASE_URL}/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ articleId })
        })
        
        const newBookmarks = [...bookmarkedArticles, articleId]
        setBookmarkedArticles(newBookmarks)
        localStorage.setItem("bookmarkedArticles", JSON.stringify(newBookmarks))
      }
      
      // Update articles to reflect bookmark change
      setArticles(prev => prev.map(article => ({
        ...article,
        isBookmarked: article.id === articleId ? !isCurrentlyBookmarked : article.isBookmarked
      })))
      
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
      // Fallback to localStorage only
      const isCurrentlyBookmarked = bookmarkedArticles.includes(articleId)
      const newBookmarks = isCurrentlyBookmarked 
        ? bookmarkedArticles.filter(id => id !== articleId)
        : [...bookmarkedArticles, articleId]
      
      setBookmarkedArticles(newBookmarks)
      localStorage.setItem("bookmarkedArticles", JSON.stringify(newBookmarks))
      
      setArticles(prev => prev.map(article => ({
        ...article,
        isBookmarked: article.id === articleId ? !isCurrentlyBookmarked : article.isBookmarked
      })))
    }
  }

  const refreshNews = async () => {
    await fetchNews(selectedCategory === "All" ? undefined : selectedCategory, searchQuery || undefined)
  }

  return (
    <NewsContext.Provider
      value={{
        articles,
        filteredArticles,
        loading,
        error,
        searchQuery,
        selectedCategory,
        bookmarkedArticles,
        setSearchQuery,
        setSelectedCategory,
        fetchNews,
        toggleBookmark,
        refreshNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  )
}

export function useNews() {
  const context = useContext(NewsContext)
  if (context === undefined) {
    throw new Error("useNews must be used within a NewsProvider")
  }
  return context
}

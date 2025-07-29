"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Bookmark, BookmarkIcon as BookmarkBorder, ListFilterIcon as FilterList, RefreshCw, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useNews } from "@/contexts/news-context"

const newsCategories = [
  "All",
  "Women's Health",
  "Mental Health",
  "Nutrition",
  "Fitness",
  "Reproductive Health",
  "Pregnancy",
  "Menopause",
  "Research",
]

export default function NewsPage() {
  const {
    filteredArticles,
    loading,
    error,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    toggleBookmark,
    refreshNews
  } = useNews()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    // Trigger a new search when category changes
    if (category !== selectedCategory) {
      await refreshNews()
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleRefresh = async () => {
    await refreshNews()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-16">
      {/* Compact Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1B3C73] to-[#40679E] py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-3"
            >
              Health News
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-[#FFCAD4] leading-relaxed max-w-2xl mx-auto"
            >
              Stay informed with the latest women's health news, research, and insights powered by real-time data.
            </motion.p>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 max-w-md mx-auto"
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#40679E] w-5 h-5" />
              <Input
                placeholder="Search health news..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-[#FFCAD4]/30 rounded-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <FilterList className="text-[#40679E] w-5 h-5" />
              {newsCategories.map((category) => (
                <motion.div key={category} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] text-white"
                        : "hover:bg-[#FFCAD4]/20 border-[#FF407D]/30"
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* News Grid - Tile Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden h-full">
                    <div className="h-48 bg-gradient-to-r from-[#FFCAD4]/30 to-[#FF407D]/30 animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            : filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col group">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 right-3"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(article.id)}
                          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                        >
                          {article.isBookmarked ? (
                            <Bookmark className="w-4 h-4 text-[#FF407D] fill-current" />
                          ) : (
                            <BookmarkBorder className="w-4 h-4 text-[#40679E]" />
                          )}
                        </Button>
                      </motion.div>
                      <Badge className="absolute top-3 left-3 bg-[#FF407D]/90 text-white backdrop-blur-sm">
                        {article.category}
                      </Badge>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-[#1B3C73] mb-2 line-clamp-2 text-lg leading-tight group-hover:text-[#FF407D] transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-[#40679E] text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {article.description}
                      </p>

                      <div className="flex justify-between items-center text-xs text-[#40679E] mt-auto mb-3">
                        <span className="font-medium">{article.newsSource}</span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="ghost"
                          className="w-full text-[#FF407D] hover:text-white hover:bg-gradient-to-r hover:from-[#FF407D] hover:to-[#FFCAD4] font-semibold transition-all duration-300"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          Read More →
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>

        {!loading && filteredArticles.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-[#1B3C73] mb-2">No articles found</h3>
            <p className="text-[#40679E]">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

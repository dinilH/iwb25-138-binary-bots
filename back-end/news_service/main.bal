import ballerina/http;
import ballerina/log;
import ballerina/url;
import ballerina/os;

// Secure API key management
string? envApiKey = os:getEnv("NEWS_API_KEY");
string apiKey = envApiKey ?: "af48587254ee42488769cafb91891908";

// News article type
type NewsArticle record {
    string id;
    string title;
    string description;
    string url;
    string imageUrl;
    string publishedAt;
    string newsSource;
    string category;
    boolean isBookmarked?;
};

// API response type
type NewsResponse record {
    boolean success;
    string message?;
    NewsArticle[] articles?;
    int totalResults?;
};

// In-memory bookmark storage
map<boolean> bookmarkedArticles = {};

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
        allowCredentials: false,
        allowHeaders: ["Content-Type"],
        allowMethods: ["GET", "POST", "DELETE", "OPTIONS"]
    }
}
service /api/news on new http:Listener(8060) {

    // Health check endpoint
    resource function get health() returns json {
        return {
            success: true,
            message: "News API is running",
            timestamp: "2025-07-28T15:00:00Z"
        };
    }

    // Get all news articles with optional filtering
    resource function get articles(string? category, string? search, int page = 1, int pageSize = 20) returns NewsResponse|error {
        string categoryStr = category is string ? category : "All";
        string searchStr = search is string ? search : "None";
        log:printInfo("Fetching news articles - Category: " + categoryStr + ", Search: " + searchStr);

        http:Client newsApiClient = check new("https://newsapi.org", timeout = 60);
        map<string> headers = { "X-Api-Key": apiKey };

        // Build query parameters
        string baseQuery = "(women+health+OR+breast+cancer+OR+ovarian+cancer+OR+reproductive+health+OR+maternal+health+OR+female+healthcare+OR+gynecology+OR+cervical+cancer+OR+fertility+OR+hormonal+health+OR+period+OR+menstruation+OR+PCOS+OR+endometriosis+OR+menopause)";
        
        // Add search term if provided
        if (search is string && search.trim().length() > 0) {
            string encodedSearch = check url:encode(search, "UTF-8");
            baseQuery = baseQuery + "+AND+" + encodedSearch;
        }

        string queryParams = "/v2/everything?q=" + baseQuery + 
                            "&sortBy=publishedAt&pageSize=" + pageSize.toString() + 
                            "&page=" + page.toString() + 
                            "&language=en&sources=medical-news-today,healthline,npr,cnn,bbc-news,the-guardian,reuters,associated-press";

        log:printInfo("Sending request to NewsAPI: " + queryParams);

        http:Response|error response = newsApiClient->get(queryParams, headers);

        if (response is error) {
            log:printError("Error calling NewsAPI", 'error = response);
            return {
                success: false,
                message: "Failed to fetch news: " + response.message(),
                articles: []
            };
        }

        if (response.statusCode == 200) {
            json|error jsonResponse = response.getJsonPayload();
            if (jsonResponse is error) {
                log:printError("Error parsing JSON response", 'error = jsonResponse);
                return {
                    success: false,
                    message: "Failed to parse news data",
                    articles: []
                };
            }

            // Transform NewsAPI response to our format
            NewsArticle[] transformedArticles = [];
            json articlesArray = check jsonResponse.articles;
            
            if (articlesArray is json[]) {
                int index = 0;
                foreach json article in articlesArray {
                    string articleId = "news_" + index.toString();
                    
                    // Safely extract fields with proper error handling
                    string title = "";
                    string description = "";
                    string articleUrl = "";
                    string imageUrl = "/placeholder.svg";
                    string publishedAt = "";
                    string sourceName = "Unknown Source";
                    
                    // Extract title
                    json|error titleResult = article.title;
                    if (titleResult is json && titleResult is string) {
                        title = titleResult;
                    }
                    
                    // Extract description
                    json|error descResult = article.description;
                    if (descResult is json && descResult is string) {
                        description = descResult;
                    }
                    
                    // Extract URL
                    json|error urlResult = article.url;
                    if (urlResult is json && urlResult is string) {
                        articleUrl = urlResult;
                    }
                    
                    // Extract image URL
                    json|error imageResult = article.urlToImage;
                    if (imageResult is json && imageResult is string) {
                        imageUrl = imageResult;
                    }
                    
                    // Extract published date
                    json|error dateResult = article.publishedAt;
                    if (dateResult is json && dateResult is string) {
                        publishedAt = dateResult;
                    }
                    
                    // Extract source name
                    json|error sourceResult = article.'source;
                    if (sourceResult is json) {
                        json|error nameResult = sourceResult.name;
                        if (nameResult is json && nameResult is string) {
                            sourceName = nameResult;
                        }
                    }
                    
                    // Categorize articles based on content
                    string assignedCategory = categorizeArticle(title, description);
                    
                    // Filter by category if specified
                    if (category is string && category != "All" && assignedCategory != category) {
                        index += 1;
                        continue;
                    }

                    NewsArticle newsArticle = {
                        id: articleId,
                        title: title,
                        description: description,
                        url: articleUrl,
                        imageUrl: imageUrl,
                        publishedAt: publishedAt,
                        newsSource: sourceName,
                        category: assignedCategory,
                        isBookmarked: bookmarkedArticles.hasKey(articleId)
                    };
                    
                    transformedArticles.push(newsArticle);
                    index += 1;
                }
            }

            return {
                success: true,
                articles: transformedArticles,
                totalResults: check jsonResponse.totalResults
            };
        } else {
            log:printError("HTTP error from NewsAPI", statusCode = response.statusCode);
            return {
                success: false,
                message: "Failed to fetch news: HTTP " + response.statusCode.toString(),
                articles: []
            };
        }
    }

    // Add bookmark
    resource function post bookmarks(@http:Payload json bookmarkData) returns json|error {
        string articleId = check bookmarkData.articleId;
        bookmarkedArticles[articleId] = true;
        log:printInfo("Article bookmarked: " + articleId);
        
        return {
            success: true,
            message: "Article bookmarked successfully"
        };
    }

    // Remove bookmark
    resource function delete bookmarks/[string articleId]() returns json|error {
        if (bookmarkedArticles.hasKey(articleId)) {
            _ = bookmarkedArticles.remove(articleId);
        }
        log:printInfo("Article unbookmarked: " + articleId);
        
        return {
            success: true,
            message: "Article unbookmarked successfully"
        };
    }

    // Get bookmarked articles
    resource function get bookmarks() returns json {
        string[] bookmarkedIds = bookmarkedArticles.keys();
        return {
            success: true,
            bookmarkedArticles: bookmarkedIds
        };
    }
}

// Helper function to categorize articles with advanced filtering
function categorizeArticle(string title, string description) returns string {
    string content = (title + " " + description).toLowerAscii();
    
    // Advanced categorization with multiple keywords and weighted scoring
    map<int> categoryScores = {};
    
    // Mental Health keywords with weights
    string[] mentalHealthKeywords = ["mental", "depression", "anxiety", "stress", "psychological", "therapy", "counseling", "wellbeing", "emotional", "mood", "psychiatric", "mindfulness", "meditation"];
    int mentalHealthScore = calculateCategoryScore(content, mentalHealthKeywords);
    categoryScores["Mental Health"] = mentalHealthScore;
    
    // Nutrition keywords
    string[] nutritionKeywords = ["nutrition", "diet", "food", "vitamin", "mineral", "supplement", "eating", "calories", "protein", "carbohydrate", "fat", "nutrient", "healthy eating", "meal"];
    categoryScores["Nutrition"] = calculateCategoryScore(content, nutritionKeywords);
    
    // Fitness keywords
    string[] fitnessKeywords = ["exercise", "fitness", "workout", "yoga", "pilates", "running", "gym", "training", "physical activity", "cardio", "strength", "muscle"];
    categoryScores["Fitness"] = calculateCategoryScore(content, fitnessKeywords);
    
    // Pregnancy keywords
    string[] pregnancyKeywords = ["pregnancy", "pregnant", "maternal", "prenatal", "postnatal", "labor", "delivery", "birth", "expecting", "trimester", "fetal", "baby"];
    categoryScores["Pregnancy"] = calculateCategoryScore(content, pregnancyKeywords);
    
    // Menopause keywords
    string[] menopauseKeywords = ["menopause", "perimenopause", "hot flashes", "hormone replacement", "estrogen", "menstrual cessation", "climacteric"];
    categoryScores["Menopause"] = calculateCategoryScore(content, menopauseKeywords);
    
    // Research keywords
    string[] researchKeywords = ["research", "study", "clinical trial", "scientific", "findings", "analysis", "experiment", "data", "publication", "peer-reviewed", "evidence"];
    categoryScores["Research"] = calculateCategoryScore(content, researchKeywords);
    
    // Reproductive Health keywords
    string[] reproductiveKeywords = ["reproductive", "fertility", "pcos", "endometriosis", "ovarian", "uterine", "cervical", "contraception", "ivf", "menstrual", "period", "cycle"];
    categoryScores["Reproductive Health"] = calculateCategoryScore(content, reproductiveKeywords);
    
    // Cancer-specific keywords
    string[] cancerKeywords = ["cancer", "tumor", "oncology", "chemotherapy", "radiation", "biopsy", "metastasis", "screening", "mammogram"];
    if (calculateCategoryScore(content, cancerKeywords) > 0) {
        int? currentScore = categoryScores.get("Women's Health");
        if (currentScore is int) {
            categoryScores["Women's Health"] = currentScore + 10; // Boost women's health for cancer
        } else {
            categoryScores["Women's Health"] = 10;
        }
    }
    
    // Find category with highest score
    string bestCategory = "Women's Health";
    int highestScore = 0;
    
    foreach string category in categoryScores.keys() {
        int? scoreResult = categoryScores.get(category);
        if (scoreResult is int && scoreResult > highestScore) {
            highestScore = scoreResult;
            bestCategory = category;
        }
    }
    
    // Minimum threshold for categorization
    if (highestScore < 2) {
        return "Women's Health"; // Default category
    }
    
    return bestCategory;
}

// Calculate weighted score for a category based on keyword matches
function calculateCategoryScore(string content, string[] keywords) returns int {
    int score = 0;
    foreach string keyword in keywords {
        if (content.includes(keyword)) {
            // Weight longer keywords higher
            if (keyword.length() > 8) {
                score += 3;
            } else if (keyword.length() > 5) {
                score += 2;
            } else {
                score += 1;
            }
            
            // Boost score for exact phrase matches
            if (content.includes(" " + keyword + " ")) {
                score += 1;
            }
        }
    }
    return score;
}


"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mood, MoodBad, SentimentSatisfied } from "@mui/icons-material"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  sentiment?: "positive" | "negative" | "neutral"
  topics?: string[]
}

interface ChatAnalytics {
  totalMessages: number
  sentimentScore: number
  topTopics: string[]
  supportLevel: "low" | "medium" | "high"
}

export default function ChatWithBotPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page since chat is now handled by the floating icons
    router.push("/")
  }, [router])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your personal health assistant. I'm here to support you with any questions about periods, wellness, mental health, or just to chat. How are you feeling today?",
      sender: "bot",
      timestamp: new Date(),
      sentiment: "positive",
      topics: ["greeting", "support"],
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [analytics, setAnalytics] = useState<ChatAnalytics>({
    totalMessages: 1,
    sentimentScore: 0.8,
    topTopics: ["greeting", "support"],
    supportLevel: "medium",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickTopics = [
    { label: "Period Pain", icon: "🩸", topic: "period" },
    { label: "Mood Swings", icon: "😔", topic: "mood" },
    { label: "Stress Relief", icon: "😌", topic: "stress" },
    { label: "Sleep Issues", icon: "😴", topic: "sleep" },
    { label: "Exercise Tips", icon: "💪", topic: "exercise" },
    { label: "Nutrition", icon: "🥗", topic: "nutrition" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeSentiment = (text: string): "positive" | "negative" | "neutral" => {
    const positiveWords = ["good", "great", "happy", "better", "fine", "well", "excellent", "amazing"]
    const negativeWords = ["bad", "terrible", "awful", "pain", "hurt", "sad", "depressed", "anxious", "worried"]

    const words = text.toLowerCase().split(" ")
    const positiveCount = words.filter((word) => positiveWords.includes(word)).length
    const negativeCount = words.filter((word) => negativeWords.includes(word)).length

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  const extractTopics = (text: string): string[] => {
    const topicKeywords = {
      period: ["period", "menstruation", "cycle", "cramps", "flow"],
      mood: ["mood", "emotional", "feelings", "sad", "happy", "angry"],
      stress: ["stress", "anxiety", "worried", "overwhelmed", "pressure"],
      sleep: ["sleep", "tired", "insomnia", "rest", "fatigue"],
      exercise: ["exercise", "workout", "fitness", "activity", "movement"],
      nutrition: ["food", "eat", "diet", "nutrition", "hungry"],
    }

    const topics: string[] = []
    const lowerText = text.toLowerCase()

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        topics.push(topic)
      }
    })

    return topics
  }

  const generateBotResponse = (userMessage: string, sentiment: string, topics: string[]): string => {
    const responses = {
      period: [
        "Period pain can be really challenging. Have you tried heat therapy or gentle exercise? These can help reduce cramps naturally.",
        "Tracking your cycle can help you prepare better. Are you using any period tracking methods?",
        "It's completely normal to experience different symptoms during your cycle. What specific concerns do you have?",
      ],
      mood: [
        "Mood changes are very common, especially during certain times of your cycle. You're not alone in feeling this way.",
        "It sounds like you're going through a tough time emotionally. Would you like to talk about what's been affecting your mood?",
        "Remember that it's okay to have ups and downs. Taking care of your mental health is just as important as physical health.",
      ],
      stress: [
        "Stress can really impact your overall health. Have you tried any relaxation techniques like deep breathing or meditation?",
        "It's important to find healthy ways to manage stress. What usually helps you feel more relaxed?",
        "Chronic stress can affect your menstrual cycle too. Let's talk about some stress-reduction strategies.",
      ],
      sleep: [
        "Good sleep is crucial for hormonal balance and overall health. What's been affecting your sleep lately?",
        "Sleep issues can be related to your menstrual cycle. Have you noticed any patterns?",
        "Creating a bedtime routine can really help improve sleep quality. Would you like some suggestions?",
      ],
    }

    if (topics.length > 0) {
      const topic = topics[0] as keyof typeof responses
      if (responses[topic]) {
        return responses[topic][Math.floor(Math.random() * responses[topic].length)]
      }
    }

    if (sentiment === "negative") {
      return "I can hear that you're going through a difficult time. Remember that it's okay to not be okay sometimes. I'm here to listen and support you. Would you like to talk more about what's bothering you?"
    }

    if (sentiment === "positive") {
      return "I'm so glad to hear you're feeling good! It's wonderful when we feel positive and energized. Is there anything specific that's been helping you feel this way?"
    }

    return "Thank you for sharing that with me. I'm here to support you with any health-related questions or concerns you might have. What would you like to talk about?"
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
      sentiment: analyzeSentiment(inputText),
      topics: extractTopics(inputText),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    // Simulate AI processing time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText, userMessage.sentiment!, userMessage.topics!),
        sender: "bot",
        timestamp: new Date(),
        sentiment: "positive",
        topics: ["support"],
      }

      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)

      // Update analytics
      setAnalytics((prev) => ({
        totalMessages: prev.totalMessages + 2,
        sentimentScore:
          (prev.sentimentScore +
            (userMessage.sentiment === "positive" ? 1 : userMessage.sentiment === "negative" ? -0.5 : 0)) /
          2,
        topTopics: [...new Set([...prev.topTopics, ...userMessage.topics!])].slice(0, 5),
        supportLevel: userMessage.sentiment === "negative" ? "high" : "medium",
      }))
    }, 1500)
  }

  const handleQuickTopic = (topic: string) => {
    const topicMessages = {
      period: "I've been having really painful periods lately. What can I do to manage the pain?",
      mood: "I've been feeling really moody and emotional. Is this normal?",
      stress: "I'm feeling overwhelmed with stress. How can I manage it better?",
      sleep: "I'm having trouble sleeping. Any suggestions?",
      exercise: "What kind of exercise is best during my period?",
      nutrition: "What foods should I eat to support my menstrual health?",
    }

    setInputText(topicMessages[topic as keyof typeof topicMessages] || `I'd like to talk about ${topic}`)
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <SentimentSatisfied sx={{ color: "#4caf50", fontSize: 16 }} />
      case "negative":
        return <MoodBad sx={{ color: "#f44336", fontSize: 16 }} />
      default:
        return <Mood sx={{ color: "#ff9800", fontSize: 16 }} />
    }
  }

  return null
}

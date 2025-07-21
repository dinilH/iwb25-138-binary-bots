"use client"

import { useState, useRef, useEffect } from "react"
import { Box, TextField, IconButton, Typography, Avatar, Chip, Paper } from "@mui/material"
import { Send, Psychology } from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  sentiment?: "positive" | "negative" | "neutral"
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your SheCare AI assistant. I'm here to support you with questions about periods, wellness, mental health, or just to chat. How are you feeling today?",
      sender: "bot",
      timestamp: new Date(),
      sentiment: "positive",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickTopics = [
    { label: "Period Pain", emoji: "🩸" },
    { label: "Mood Support", emoji: "💙" },
    { label: "Stress Relief", emoji: "😌" },
    { label: "Sleep Issues", emoji: "😴" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("period") || lowerMessage.includes("menstruation")) {
      return "I understand you have questions about your period. This is completely normal! Can you tell me more about what specific concerns you have? I can help with cycle tracking, symptoms, or general period health information."
    }

    if (lowerMessage.includes("mood") || lowerMessage.includes("emotional") || lowerMessage.includes("sad")) {
      return "I hear that you're dealing with emotional concerns. Your feelings are valid, and it's important to acknowledge them. Would you like to talk about what's been affecting your mood? I can also suggest some coping strategies that might help."
    }

    if (lowerMessage.includes("pain") || lowerMessage.includes("hurt")) {
      return "I'm sorry you're experiencing pain. While I can provide general information and support, it's important to consult with a healthcare provider for persistent or severe pain. In the meantime, would you like some tips for managing discomfort?"
    }

    return "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about what you're experiencing so I can better assist you?"
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText),
        sender: "bot",
        timestamp: new Date(),
        sentiment: "positive",
      }

      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickTopic = (topic: string) => {
    setInputText(`I'd like to talk about ${topic.toLowerCase()}`)
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                {message.sender === "bot" && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                      background: "linear-gradient(135deg, #FF407D 0%, #1B3C73 100%)",
                    }}
                  >
                    <Psychology sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    maxWidth: "70%",
                    p: 2,
                    borderRadius: message.sender === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                    background:
                      message.sender === "user"
                        ? "linear-gradient(135deg, #FF407D 0%, #1B3C73 100%)"
                        : "rgba(255, 255, 255, 0.9)",
                    color: message.sender === "user" ? "white" : "#1B3C73",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      display: "block",
                      mt: 1,
                      fontSize: "0.75rem",
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Paper>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #FF407D 0%, #1B3C73 100%)",
                }}
              >
                <Psychology sx={{ fontSize: 18 }} />
              </Avatar>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: "20px 20px 20px 5px",
                  background: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography variant="body1">Typing...</Typography>
              </Paper>
            </Box>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Topics */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
        <Typography variant="body2" sx={{ color: "#40679E", mb: 1 }}>
          Quick topics:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {quickTopics.map((topic) => (
            <Chip
              key={topic.label}
              label={`${topic.emoji} ${topic.label}`}
              onClick={() => handleQuickTopic(topic.label)}
              sx={{
                background: "rgba(255, 64, 125, 0.1)",
                color: "#FF407D",
                border: "1px solid rgba(255, 64, 125, 0.3)",
                "&:hover": {
                  background: "rgba(255, 64, 125, 0.2)",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          background: "rgba(255, 255, 255, 0.5)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            variant="outlined"
            size="small"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "25px",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            sx={{
              background: "linear-gradient(135deg, #FF407D 0%, #1B3C73 100%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #e63946 0%, #1B3C73 100%)",
              },
              "&:disabled": {
                background: "#ccc",
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

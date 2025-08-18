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

  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return data.message || 'Sorry, I could not generate a response at the moment.';
    } catch (error) {
      console.error('Error getting bot response:', error);
      return 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const currentInput = inputText;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    try {
      const botResponseText = await getBotResponse(currentInput);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
        sentiment: "positive",
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: "bot",
        timestamp: new Date(),
        sentiment: "negative",
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
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

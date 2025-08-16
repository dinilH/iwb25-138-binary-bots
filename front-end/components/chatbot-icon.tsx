"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const predefinedPrompts = [
  "How can I ease cramps?",
  "What does my cycle mean?",
  "Tips for better sleep during periods",
  "How to track my wellness?",
  "What are normal period symptoms?",
  "How to manage mood swings?",
  "Best foods for hormonal balance",
  "Exercise during menstruation",
]

export default function ChatbotIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your SheCare AI assistant 👋 I'm here to help with your health questions, period tracking, and wellness concerns. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
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

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const botResponseText = await getBotResponse(messageText);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Floating Chat Icon */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] hover:from-[#FFCAD4] hover:to-[#FF407D] shadow-lg transition-all duration-300 border-4 border-white"
          size="icon"
        >
          {isOpen ? <X className="w-6 h-6" /> : <div className="text-2xl">👩‍⚕️</div>}
        </Button>
      </motion.div>

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={handleClickOutside}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-24 right-6 w-80 h-[500px] md:w-96 md:h-[600px] mt-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 shadow-2xl h-full flex flex-col bg-white rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] text-white rounded-t-xl p-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="text-xl">👩‍⚕️</div>
                    SheCare AI Assistant
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0 flex flex-col min-h-0 bg-white">
                  <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl ${
                              message.isUser
                                ? "bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] text-white rounded-br-md"
                                : "bg-[#F0F4F8] text-[#1B3C73] rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-[#F0F4F8] text-[#1B3C73] p-3 rounded-2xl rounded-bl-md">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-[#FF407D] rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-[#FF407D] rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-[#FF407D] rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Predefined Prompts */}
                  <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap gap-1 mb-3 max-h-20 overflow-y-auto">
                      {predefinedPrompts.slice(0, 4).map((prompt, index) => (
                        <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Badge
                            variant="outline"
                            className="cursor-pointer text-xs hover:bg-[#FFCAD4]/20 hover:border-[#FF407D] transition-colors py-1"
                            onClick={() => handleSendMessage(prompt)}
                          >
                            {prompt}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about your health..."
                        className="flex-1 border-gray-200 rounded-full"
                        disabled={isTyping}
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleSendMessage()}
                          size="icon"
                          disabled={isTyping || !inputMessage.trim()}
                          className="bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] hover:from-[#FFCAD4] hover:to-[#FF407D] rounded-full"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

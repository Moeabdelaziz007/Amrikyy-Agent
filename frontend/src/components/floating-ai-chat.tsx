
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from "lucide-react"
import { useSound } from "@/hooks/use-sound"

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hello! I'm Amrikyy AI Assistant. How can I help you manage your agents today?" },
  ])
  const [input, setInput] = useState("")
  const { playSound } = useSound()

  const handleSendMessage = () => {
    if (!input.trim()) return

    playSound("message")
    setMessages((prev) => [...prev, { role: "user", content: input }])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      playSound("response")
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm processing your request. This is a demo response. In production, this would connect to Gemini AI.",
        },
      ])
    }, 1000)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen)
          playSound("click")
        }}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 z-40 amrikyy-glow"
        size="icon"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-h-96 glass shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent" />
              Amrikyy AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col h-64">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-muted-foreground rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="text-sm"
                />
                <Button onClick={handleSendMessage} size="sm" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

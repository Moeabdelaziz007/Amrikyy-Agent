import Foundation
import Combine

class AIAssistantViewModel: BaseViewModel {
    @Published var messages: [Message] = []
    @Published var currentMessage: String = ""
    @Published var isTyping = false
    
    private let aiService = AIService.shared
    private let authService = AuthService.shared
    
    override init() {
        super.init()
        // Add welcome message
        addWelcomeMessage()
    }
    
    private func addWelcomeMessage() {
        let welcomeMessage = Message(
            content: "مرحباً! أنا مايا، مساعدتك الذكية للسفر. كيف يمكنني مساعدتك اليوم؟\n\nHello! I'm Maya, your AI travel assistant. How can I help you today?",
            role: .assistant
        )
        messages.append(welcomeMessage)
    }
    
    func sendMessage() {
        guard !currentMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let userMessage = Message(
            content: currentMessage,
            role: .user,
            userId: authService.currentUser?.id
        )
        
        messages.append(userMessage)
        let messageText = currentMessage
        currentMessage = ""
        
        Task {
            await getAIResponse(for: messageText)
        }
    }
    
    @MainActor
    private func getAIResponse(for message: String) async {
        isTyping = true
        
        do {
            // Convert messages to history format
            let history = messages.map { msg in
                Message(
                    content: msg.content,
                    role: msg.role,
                    timestamp: msg.timestamp
                )
            }
            
            let response = try await aiService.chat(
                message: message,
                conversationHistory: history,
                useTools: false,
                region: "ar"
            )
            
            let assistantMessage = Message(
                content: response.content,
                role: .assistant,
                metadata: MessageMetadata(
                    model: response.model,
                    language: "ar"
                )
            )
            
            self.messages.append(assistantMessage)
            isTyping = false
        } catch {
            isTyping = false
            handleError(error)
            
            // Add error message to chat
            let errorMessage = Message(
                content: "عذراً، حدث خطأ في معالجة طلبك. الرجاء المحاولة مرة أخرى.\n\nSorry, there was an error processing your request. Please try again.",
                role: .assistant
            )
            self.messages.append(errorMessage)
        }
    }
    
    func clearConversation() {
        messages.removeAll()
        addWelcomeMessage()
    }
}


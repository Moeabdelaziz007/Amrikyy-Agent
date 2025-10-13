import Foundation
import Combine

@MainActor
public final class ChatViewModel: ObservableObject {
    @Published public private(set) var messages: [ChatMessage] = []
    @Published public private(set) var isStreaming: Bool = false

    private let aiService: AIService

    public init(aiService: AIService = AIService()) {
        self.aiService = aiService
    }

    public func send(text: String, planId: UUID? = nil) async {
        let userMessage = ChatMessage(role: .user, content: text, planId: planId)
        messages.append(userMessage)
        do {
            let response = try await aiService.sendMessage(message: text, stream: false, planId: planId)
            let assistantMessage = ChatMessage(role: .assistant, content: response.model + ": response", planId: planId)
            messages.append(assistantMessage)
        } catch {
            let errorMessage = ChatMessage(role: .system, content: "Error: \(error.localizedDescription)")
            messages.append(errorMessage)
        }
    }
}

import Foundation
import Combine

protocol ChatServiceProtocol {
    func sendMessage(_ message: String, planId: String) -> AnyPublisher<ChatResponse, Error>
    func sendStreamingMessage(_ message: String, planId: String) -> AnyPublisher<ChatStreamResponse, Error>
}

struct ChatStreamResponse: Codable {
    let content: String
    let done: Bool
    let planId: String?

    enum CodingKeys: String, CodingKey {
        case content, done
        case planId = "plan_id"
    }
}

class ChatService: ChatServiceProtocol {
    private let apiService: APIServiceProtocol

    init(apiService: APIServiceProtocol = APIService.shared) {
        self.apiService = apiService
    }

    func sendMessage(_ message: String, planId: String) -> AnyPublisher<ChatResponse, Error> {
        let request = ChatRequest(message: message, planId: planId, userId: nil)

        guard let body = try? JSONEncoder().encode(request) else {
            return Fail(error: NetworkError.invalidURL).eraseToAnyPublisher()
        }

        let endpoint = APIEndpoint(path: "/api/ai/chat", method: .POST, body: body)

        return apiService.request(endpoint)
            .mapError { $0 as Error }
            .eraseToAnyPublisher()
    }

    func sendStreamingMessage(_ message: String, planId: String) -> AnyPublisher<ChatStreamResponse, Error> {
        // For now, return a simple implementation
        // This would be replaced with actual WebSocket or SSE implementation
        return Just(ChatStreamResponse(content: "Streaming not yet implemented", done: true, planId: planId))
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
}
import Foundation

public final class AIService {
    private let client: APIClient

    public init(client: APIClient = .shared) {
        self.client = client
    }

    public struct ChatRequest: Encodable {
        public let message: String
        public let stream: Bool
        public let planId: UUID?
    }

    public func sendMessage(message: String, stream: Bool = false, planId: UUID? = nil) async throws -> AIResponse {
        let payload = ChatRequest(message: message, stream: stream, planId: planId)
        let body = try client.jsonEncoder().encode(payload)
        let response: AIResponse = try await client.request(
            path: "/api/ai/chat",
            method: "POST",
            headers: [:],
            body: body
        )
        return response
    }
}

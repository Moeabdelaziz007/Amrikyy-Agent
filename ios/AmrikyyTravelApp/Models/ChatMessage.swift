import Foundation

public enum MessageRole: String, Codable, Equatable {
    case user
    case assistant
    case system
}

public struct ChatMessage: Identifiable, Codable, Equatable {
    public let id: UUID
    public var role: MessageRole
    public var content: String
    public var createdAt: Date
    public var planId: UUID?

    public init(
        id: UUID = UUID(),
        role: MessageRole,
        content: String,
        createdAt: Date = Date(),
        planId: UUID? = nil
    ) {
        self.id = id
        self.role = role
        self.content = content
        self.createdAt = createdAt
        self.planId = planId
    }
}

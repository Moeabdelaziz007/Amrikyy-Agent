import Foundation

/// Message model for AI chat
struct Message: Codable, Identifiable, Hashable {
    let id: String
    var content: String
    var role: MessageRole
    var timestamp: Date
    var userId: String?
    var conversationId: String?
    var metadata: MessageMetadata?
    
    enum MessageRole: String, Codable {
        case user = "user"
        case assistant = "assistant"
        case system = "system"
    }
    
    init(
        id: String = UUID().uuidString,
        content: String,
        role: MessageRole,
        timestamp: Date = Date(),
        userId: String? = nil,
        conversationId: String? = nil,
        metadata: MessageMetadata? = nil
    ) {
        self.id = id
        self.content = content
        self.role = role
        self.timestamp = timestamp
        self.userId = userId
        self.conversationId = conversationId
        self.metadata = metadata
    }
}

struct MessageMetadata: Codable, Hashable {
    var model: String?
    var tokens: Int?
    var language: String?
    var toolCalls: [String]?
}

/// Conversation model
struct Conversation: Codable, Identifiable {
    let id: String
    var title: String?
    var messages: [Message]
    var userId: String?
    var createdAt: Date
    var updatedAt: Date
    
    init(
        id: String = UUID().uuidString,
        title: String? = nil,
        messages: [Message] = [],
        userId: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.title = title
        self.messages = messages
        self.userId = userId
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case messages
        case userId = "user_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}


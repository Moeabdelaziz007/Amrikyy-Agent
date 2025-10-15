import Foundation

public struct AIResponse: Identifiable, Codable, Equatable {
    public let id: UUID
    public var messageId: UUID
    public var model: String
    public var tokensUsed: Int?
    public var latencyMs: Int?
    public var costUsd: Decimal?
    public var createdAt: Date

    public init(
        id: UUID = UUID(),
        messageId: UUID,
        model: String,
        tokensUsed: Int? = nil,
        latencyMs: Int? = nil,
        costUsd: Decimal? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.messageId = messageId
        self.model = model
        self.tokensUsed = tokensUsed
        self.latencyMs = latencyMs
        self.costUsd = costUsd
        self.createdAt = createdAt
    }
}

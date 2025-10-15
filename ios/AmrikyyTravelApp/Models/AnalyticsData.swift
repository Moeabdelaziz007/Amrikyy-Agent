import Foundation

public struct AnalyticsData: Identifiable, Codable, Equatable {
    public let id: UUID
    public var date: Date
    public var sessions: Int
    public var messages: Int
    public var avgLatencyMs: Int
    public var costUsd: Decimal
    public var revenueUsd: Decimal

    public init(
        id: UUID = UUID(),
        date: Date,
        sessions: Int,
        messages: Int,
        avgLatencyMs: Int,
        costUsd: Decimal,
        revenueUsd: Decimal
    ) {
        self.id = id
        self.date = date
        self.sessions = sessions
        self.messages = messages
        self.avgLatencyMs = avgLatencyMs
        self.costUsd = costUsd
        self.revenueUsd = revenueUsd
    }
}

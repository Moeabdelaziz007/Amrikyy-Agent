import Foundation

public struct TravelPlan: Identifiable, Codable, Equatable {
    public let id: UUID
    public var userId: UUID
    public var destinations: [Destination]
    public var startDate: Date
    public var endDate: Date
    public var budget: Decimal?
    public var currency: String?
    public var notes: String?
    public var createdAt: Date
    public var updatedAt: Date

    public init(
        id: UUID = UUID(),
        userId: UUID,
        destinations: [Destination] = [],
        startDate: Date,
        endDate: Date,
        budget: Decimal? = nil,
        currency: String? = nil,
        notes: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.userId = userId
        self.destinations = destinations
        self.startDate = startDate
        self.endDate = endDate
        self.budget = budget
        self.currency = currency
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

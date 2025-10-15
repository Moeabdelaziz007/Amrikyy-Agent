import Foundation

public struct User: Identifiable, Codable, Equatable {
    public let id: UUID
    public var name: String
    public var email: String?
    public var avatarURL: URL?
    public var createdAt: Date
    public var updatedAt: Date

    public init(id: UUID = UUID(), name: String, email: String? = nil, avatarURL: URL? = nil, createdAt: Date = Date(), updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.email = email
        self.avatarURL = avatarURL
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

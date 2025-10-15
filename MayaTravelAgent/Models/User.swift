import Foundation

/// User model representing an authenticated user
struct User: Codable, Identifiable, Hashable {
    let id: String
    var email: String?
    var username: String?
    var telegramId: Int64?
    var avatarUrl: String?
    var firstName: String?
    var lastName: String?
    var preferences: UserPreferences?
    var createdAt: Date?
    var updatedAt: Date?
    
    var displayName: String {
        if let firstName = firstName, let lastName = lastName {
            return "\(firstName) \(lastName)"
        } else if let username = username {
            return username
        } else if let email = email {
            return email
        } else {
            return "User"
        }
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case username
        case telegramId = "telegram_id"
        case avatarUrl = "avatar_url"
        case firstName = "first_name"
        case lastName = "last_name"
        case preferences
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

/// User preferences for personalization
struct UserPreferences: Codable, Hashable {
    var language: String = "en"
    var currency: String = "USD"
    var travelStyle: TravelStyle = .balanced
    var interests: [String] = []
    var dietaryRestrictions: [String] = []
    var notificationsEnabled: Bool = true
    
    enum TravelStyle: String, Codable, CaseIterable {
        case budget = "budget"
        case balanced = "balanced"
        case luxury = "luxury"
        
        var displayName: String {
            switch self {
            case .budget: return "Budget"
            case .balanced: return "Balanced"
            case .luxury: return "Luxury"
            }
        }
    }
}

/// Guest user for unauthenticated access
extension User {
    static var guest: User {
        User(
            id: "guest",
            email: nil,
            username: "Guest",
            preferences: UserPreferences()
        )
    }
    
    var isGuest: Bool {
        return id == "guest"
    }
}

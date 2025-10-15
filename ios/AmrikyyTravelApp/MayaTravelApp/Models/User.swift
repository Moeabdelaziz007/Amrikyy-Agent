import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let avatar: String?
    let preferences: UserPreferences
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, email, name, avatar, preferences
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct UserPreferences: Codable {
    let language: String
    let currency: String
    let notifications: NotificationSettings
    let travelPreferences: TravelPreferences
}

struct NotificationSettings: Codable {
    let pushNotifications: Bool
    let emailNotifications: Bool
    let smsNotifications: Bool
    let marketingEmails: Bool
}

struct TravelPreferences: Codable {
    let budgetRange: BudgetRange
    let preferredDestinations: [String]
    let travelStyle: TravelStyle
    let accommodationType: AccommodationType
}

enum BudgetRange: String, Codable {
    case budget = "budget"
    case moderate = "moderate"
    case luxury = "luxury"
}

enum TravelStyle: String, Codable {
    case adventure = "adventure"
    case relaxation = "relaxation"
    case cultural = "cultural"
    case business = "business"
    case family = "family"
}

enum AccommodationType: String, Codable {
    case hotel = "hotel"
    case hostel = "hostel"
    case apartment = "apartment"
    case resort = "resort"
    case villa = "villa"
}
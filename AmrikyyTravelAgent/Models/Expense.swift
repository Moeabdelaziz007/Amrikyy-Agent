import Foundation

/// Expense model for budget tracking
struct Expense: Codable, Identifiable, Hashable {
    let id: String
    var amount: Double
    var currency: String
    var category: ExpenseCategory
    var description: String
    var date: Date
    var tripId: String?
    var notes: String?
    var createdAt: Date?
    
    enum ExpenseCategory: String, Codable, CaseIterable {
        case accommodation = "accommodation"
        case transportation = "transportation"
        case food = "food"
        case activities = "activities"
        case shopping = "shopping"
        case other = "other"
        
        var displayName: String {
            rawValue.capitalized
        }
        
        var icon: String {
            switch self {
            case .accommodation: return "bed.double.fill"
            case .transportation: return "car.fill"
            case .food: return "fork.knife"
            case .activities: return "figure.walk"
            case .shopping: return "bag.fill"
            case .other: return "ellipsis.circle"
            }
        }
        
        var color: String {
            switch self {
            case .accommodation: return "blue"
            case .transportation: return "green"
            case .food: return "orange"
            case .activities: return "purple"
            case .shopping: return "pink"
            case .other: return "gray"
            }
        }
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case amount
        case currency
        case category
        case description
        case date
        case tripId = "trip_id"
        case notes
        case createdAt = "created_at"
    }
    
    init(
        id: String = UUID().uuidString,
        amount: Double,
        currency: String = "USD",
        category: ExpenseCategory,
        description: String,
        date: Date = Date(),
        tripId: String? = nil,
        notes: String? = nil,
        createdAt: Date? = Date()
    ) {
        self.id = id
        self.amount = amount
        self.currency = currency
        self.category = category
        self.description = description
        self.date = date
        self.tripId = tripId
        self.notes = notes
        self.createdAt = createdAt
    }
}


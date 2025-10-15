import Foundation

/// Travel plan model representing a trip
struct TravelPlan: Codable, Identifiable, Hashable {
    let id: String
    var destination: String
    var startDate: Date
    var endDate: Date
    var budget: Double
    var currency: String
    var travelers: Int
    var status: PlanStatus
    var userId: String?
    var description: String?
    var imageUrl: String?
    var activities: [Activity]
    var expenses: [Expense]
    var notes: String?
    var createdAt: Date?
    var updatedAt: Date?
    
    var duration: Int {
        Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 0
    }
    
    var totalExpenses: Double {
        expenses.reduce(0) { $0 + $1.amount }
    }
    
    var remainingBudget: Double {
        budget - totalExpenses
    }
    
    var isOverBudget: Bool {
        totalExpenses > budget
    }
    
    enum PlanStatus: String, Codable, CaseIterable {
        case draft = "draft"
        case planned = "planned"
        case ongoing = "ongoing"
        case completed = "completed"
        case cancelled = "cancelled"
        
        var displayName: String {
            rawValue.capitalized
        }
        
        var icon: String {
            switch self {
            case .draft: return "pencil.circle"
            case .planned: return "calendar"
            case .ongoing: return "airplane"
            case .completed: return "checkmark.circle"
            case .cancelled: return "xmark.circle"
            }
        }
    }

    enum CodingKeys: String, CodingKey {
        case id
        case destination
        case startDate = "start_date"
        case endDate = "end_date"
        case budget
        case currency
        case travelers
        case status
        case userId = "user_id"
        case description
        case imageUrl = "image_url"
        case activities
        case expenses
        case notes
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    init(
        id: String = UUID().uuidString,
        destination: String,
        startDate: Date,
        endDate: Date,
        budget: Double,
        currency: String = "USD",
        travelers: Int = 1,
        status: PlanStatus = .draft,
        userId: String? = nil,
        description: String? = nil,
        imageUrl: String? = nil,
        activities: [Activity] = [],
        expenses: [Expense] = [],
        notes: String? = nil,
        createdAt: Date? = Date(),
        updatedAt: Date? = Date()
    ) {
        self.id = id
        self.destination = destination
        self.startDate = startDate
        self.endDate = endDate
        self.budget = budget
        self.currency = currency
        self.travelers = travelers
        self.status = status
        self.userId = userId
        self.description = description
        self.imageUrl = imageUrl
        self.activities = activities
        self.expenses = expenses
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

/// Activity within a travel plan
struct Activity: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var description: String?
    var date: Date?
    var time: String?
    var location: String?
    var cost: Double?
    var category: ActivityCategory
    var isBooked: Bool

enum ActivityCategory: String, Codable, CaseIterable {
        case accommodation = "accommodation"
        case transportation = "transportation"
        case dining = "dining"
    case sightseeing = "sightseeing"
        case entertainment = "entertainment"
    case shopping = "shopping"
        case other = "other"
        
        var icon: String {
            switch self {
            case .accommodation: return "bed.double.fill"
            case .transportation: return "car.fill"
            case .dining: return "fork.knife"
            case .sightseeing: return "eye.fill"
            case .entertainment: return "theatermasks.fill"
            case .shopping: return "bag.fill"
            case .other: return "star.fill"
            }
        }
    }
    
    init(
        id: String = UUID().uuidString,
        name: String,
        description: String? = nil,
        date: Date? = nil,
        time: String? = nil,
        location: String? = nil,
        cost: Double? = nil,
        category: ActivityCategory = .other,
        isBooked: Bool = false
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.date = date
        self.time = time
        self.location = location
        self.cost = cost
        self.category = category
        self.isBooked = isBooked
    }
}

/// Destination model
struct Destination: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var country: String
    var description: String?
    var imageUrl: String?
    var rating: Double?
    var popularityScore: Int?
    var bestTimeToVisit: String?
    var averageCost: Double?
    var currency: String?
    
    init(
        id: String = UUID().uuidString,
        name: String,
        country: String,
        description: String? = nil,
        imageUrl: String? = nil,
        rating: Double? = nil,
        popularityScore: Int? = nil,
        bestTimeToVisit: String? = nil,
        averageCost: Double? = nil,
        currency: String? = "USD"
    ) {
        self.id = id
        self.name = name
        self.country = country
        self.description = description
        self.imageUrl = imageUrl
        self.rating = rating
        self.popularityScore = popularityScore
        self.bestTimeToVisit = bestTimeToVisit
        self.averageCost = averageCost
        self.currency = currency
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case country
        case description
        case imageUrl = "image_url"
        case rating
        case popularityScore = "popularity_score"
        case bestTimeToVisit = "best_time_to_visit"
        case averageCost = "average_cost"
        case currency
    }
}

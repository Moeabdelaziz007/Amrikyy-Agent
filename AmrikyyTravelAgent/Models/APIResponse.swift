import Foundation

/// Generic API response wrapper
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: String?
    let message: String?
    let timestamp: String?
    
    var isSuccess: Bool {
        success && error == nil
    }
}

/// AI Chat response
struct AIChatResponse: Codable {
    let success: Bool
    let reply: String?
    let timestamp: String
    let model: String?
    let error: String?
    
    var content: String {
        reply ?? error ?? "No response"
    }
}

/// Travel recommendations response
struct TravelRecommendationsResponse: Codable {
    let success: Bool
    let recommendations: String?
    let destination: String?
    let budget: Double?
    let duration: Int?
    let timestamp: String?
    let error: String?
}

/// Budget analysis response
struct BudgetAnalysisResponse: Codable {
    let success: Bool
    let analysis: String?
    let tripData: [String: AnyCodable]?
    let totalBudget: Double?
    let timestamp: String?
    let error: String?
}

/// Destination insights response
struct DestinationInsightsResponse: Codable {
    let success: Bool
    let insights: String?
    let destination: String?
    let travelType: String?
    let timestamp: String?
    let error: String?
}

/// Payment response
struct PaymentResponse: Codable {
    let success: Bool
    let paymentLink: PaymentLink?
    let payment: Payment?
    let message: String?
    let error: String?
}

struct PaymentLink: Codable {
    let id: String
    let url: String
    let amount: Double
    let currency: String
    let description: String?
    let status: String
}

struct Payment: Codable {
    let id: String
    let amount: [String: String]?
    let description: String?
    let state: String?
    let createTime: String?

    enum CodingKeys: String, CodingKey {
        case id
        case amount
        case description
        case state
        case createTime = "create_time"
    }
}

/// Auth response
struct AuthResponse: Codable {
    let token: String
    let profile: User?
    let error: String?
}

/// Health check response
struct HealthResponse: Codable {
    let success: Bool
    let status: String
    let service: String?
    let timestamp: String
    let error: String?
}

/// Helper for encoding/decoding dynamic JSON values
struct AnyCodable: Codable {
    let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        
        if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dictionary = try? container.decode([String: AnyCodable].self) {
            value = dictionary.mapValues { $0.value }
        } else {
            value = NSNull()
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        
        switch value {
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let bool as Bool:
            try container.encode(bool)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dictionary as [String: Any]:
            try container.encode(dictionary.mapValues { AnyCodable($0) })
        default:
            try container.encodeNil()
        }
    }
}

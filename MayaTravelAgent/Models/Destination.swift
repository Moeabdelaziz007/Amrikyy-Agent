import Foundation

/// Destination model representing a travel destination
struct Destination: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let country: String
    let description: String?
    let imageUrl: String?
    let rating: Double
    let popularityScore: Int?
    let bestTimeToVisit: String?
    let averageCost: Double?
    let currency: String?

    enum CodingKeys: String, CodingKey {
        case id, name, country, description, imageUrl, rating, popularityScore, bestTimeToVisit, averageCost, currency
    }

    init(
        id: String = UUID().uuidString,
        name: String,
        country: String,
        description: String? = nil,
        imageUrl: String? = nil,
        rating: Double = 0.0,
        popularityScore: Int? = nil,
        bestTimeToVisit: String? = nil,
        averageCost: Double? = nil,
        currency: String? = nil
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

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        country = try container.decode(String.self, forKey: .country)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        imageUrl = try container.decodeIfPresent(String.self, forKey: .imageUrl)
        rating = try container.decode(Double.self, forKey: .rating)
        popularityScore = try container.decodeIfPresent(Int.self, forKey: .popularityScore)
        bestTimeToVisit = try container.decodeIfPresent(String.self, forKey: .bestTimeToVisit)
        averageCost = try container.decodeIfPresent(Double.self, forKey: .averageCost)
        currency = try container.decodeIfPresent(String.self, forKey: .currency)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encode(country, forKey: .country)
        try container.encodeIfPresent(description, forKey: .description)
        try container.encodeIfPresent(imageUrl, forKey: .imageUrl)
        try container.encode(rating, forKey: .rating)
        try container.encodeIfPresent(popularityScore, forKey: .popularityScore)
        try container.encodeIfPresent(bestTimeToVisit, forKey: .bestTimeToVisit)
        try container.encodeIfPresent(averageCost, forKey: .averageCost)
        try container.encodeIfPresent(currency, forKey: .currency)
    }
}

// MARK: - API Response Models

/// Response wrapper for paginated destinations
struct DestinationsResponse: Codable {
    let destinations: [Destination]
    let totalCount: Int
    let currentPage: Int
    let totalPages: Int
    let hasNextPage: Bool
    let hasPreviousPage: Bool

    enum CodingKeys: String, CodingKey {
        case destinations, totalCount, currentPage, totalPages, hasNextPage, hasPreviousPage
    }
}

/// Response wrapper for single destination
struct DestinationResponse: Codable {
    let destination: Destination

    enum CodingKeys: String, CodingKey {
        case destination
    }
}

/// Search query parameters
struct DestinationSearchQuery: Codable {
    let query: String
    let page: Int
    let limit: Int

    enum CodingKeys: String, CodingKey {
        case query, page, limit
    }
}
import Foundation

public final class TravelService {
    private let client: APIClient

    public init(client: APIClient = .shared) {
        self.client = client
    }

    public func fetchPlans(for userId: UUID) async throws -> [TravelPlan] {
        try await client.request(path: "/api/travel/plans?userId=\(userId.uuidString)")
    }

    public func createPlan(_ plan: TravelPlan) async throws -> TravelPlan {
        let body = try client.jsonEncoder().encode(plan)
        return try await client.request(path: "/api/travel/plans", method: "POST", body: body)
    }

    public func updatePlan(_ plan: TravelPlan) async throws -> TravelPlan {
        let body = try client.jsonEncoder().encode(plan)
        return try await client.request(path: "/api/travel/plans/\(plan.id.uuidString)", method: "PUT", body: body)
    }

    public func fetchDestinations(query: String) async throws -> [Destination] {
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        return try await client.request(path: "/api/travel/destinations?query=\(encodedQuery)")
    }
}

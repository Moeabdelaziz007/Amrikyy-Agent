import Foundation

public final class AnalyticsService {
    private let client: APIClient

    public init(client: APIClient = .shared) {
        self.client = client
    }

    public func pushClientMetrics(_ metrics: AnalyticsData) async throws -> Bool {
        let body = try client.jsonEncoder().encode(metrics)
        struct OK: Decodable { let ok: Bool }
        let result: OK = try await client.request(path: "/api/analytics/metrics", method: "POST", body: body)
        return result.ok
    }

    public func fetchDailyMetrics(start: Date, end: Date) async throws -> [AnalyticsData] {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let startStr = formatter.string(from: start)
        let endStr = formatter.string(from: end)
        return try await client.request(path: "/api/analytics/daily?start=\(startStr)&end=\(endStr)")
    }
}

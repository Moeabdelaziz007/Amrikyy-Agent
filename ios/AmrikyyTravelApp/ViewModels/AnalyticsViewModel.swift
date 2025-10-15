import Foundation

@MainActor
public final class AnalyticsViewModel: ObservableObject {
    @Published public private(set) var daily: [AnalyticsData] = []

    private let analyticsService: AnalyticsService

    public init(analyticsService: AnalyticsService = AnalyticsService()) {
        self.analyticsService = analyticsService
    }

    public func load(range: ClosedRange<Date>) async {
        do {
            let data = try await analyticsService.fetchDailyMetrics(start: range.lowerBound, end: range.upperBound)
            self.daily = data
        } catch {
            self.daily = []
        }
    }
}

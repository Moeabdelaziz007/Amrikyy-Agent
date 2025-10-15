import Foundation

@MainActor
public final class TravelPlannerViewModel: ObservableObject {
    @Published public private(set) var currentPlan: TravelPlan?
    @Published public private(set) var availableDestinations: [Destination] = []

    private let travelService: TravelService

    public init(travelService: TravelService = TravelService()) {
        self.travelService = travelService
    }

    public func loadPlans(for userId: UUID) async {
        do {
            let plans = try await travelService.fetchPlans(for: userId)
            self.currentPlan = plans.first
        } catch {
            // In a full app we'd surface an error state
        }
    }

    public func searchDestinations(query: String) async {
        do {
            self.availableDestinations = try await travelService.fetchDestinations(query: query)
        } catch {
            self.availableDestinations = []
        }
    }
}

import Foundation
import Combine

class TravelPlanViewModel: BaseViewModel {
    @Published var travelPlans: [TravelPlan] = []
    @Published var selectedTravelPlan: TravelPlan?
    @Published var isCreatingPlan = false

    private let apiService: APIServiceProtocol

    init(apiService: APIServiceProtocol = APIService.shared) {
        self.apiService = apiService
        super.init()
    }

    func loadTravelPlans() {
        startLoading()

        // For now, simulate API call
        // This will be replaced with actual API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.travelPlans = []
            self.stopLoading()
        }
    }

    func createTravelPlan(_ plan: TravelPlan) {
        isCreatingPlan = true
        startLoading()

        // For now, simulate API call
        // This will be replaced with actual API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.travelPlans.append(plan)
            self.isCreatingPlan = false
            self.stopLoading()
        }
    }

    func updateTravelPlan(_ plan: TravelPlan) {
        startLoading()

        // For now, simulate API call
        // This will be replaced with actual API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            if let index = self.travelPlans.firstIndex(where: { $0.id == plan.id }) {
                self.travelPlans[index] = plan
            }
            self.stopLoading()
        }
    }

    func deleteTravelPlan(_ planId: String) {
        startLoading()

        // For now, simulate API call
        // This will be replaced with actual API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.travelPlans.removeAll { $0.id == planId }
            self.stopLoading()
        }
    }

    func selectTravelPlan(_ plan: TravelPlan) {
        selectedTravelPlan = plan
    }

    func clearSelection() {
        selectedTravelPlan = nil
    }
}
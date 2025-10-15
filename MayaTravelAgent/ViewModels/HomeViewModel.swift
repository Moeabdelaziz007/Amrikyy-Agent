import Foundation
import Combine

class HomeViewModel: BaseViewModel {
    @Published var upcomingTrips: [TravelPlan] = []
    @Published var recentDestinations: [Destination] = []
    @Published var totalBudget: Double = 0
    @Published var totalExpenses: Double = 0
    
    private let tripService = TripService.shared
    private let authService = AuthService.shared
    
    override init() {
        super.init()
        loadData()
    }
    
    func loadData() {
        Task {
            await loadTrips()
            await loadDestinations()
        }
    }
    
    @MainActor
    private func loadTrips() async {
        setLoading(true)
        
        do {
            let trips = try await tripService.getTrips(userId: authService.currentUser?.id)
            
            // Filter upcoming trips
            let upcoming = trips.filter { trip in
                trip.status == .planned || trip.status == .ongoing
            }.sorted { $0.startDate < $1.startDate }
            
            self.upcomingTrips = Array(upcoming.prefix(5))
            
            // Calculate totals
            self.totalBudget = trips.reduce(0) { $0 + $1.budget }
            self.totalExpenses = trips.reduce(0) { $0 + $1.totalExpenses }
            
            setLoading(false)
        } catch {
            handleError(error)
        }
    }
    
    @MainActor
    private func loadDestinations() async {
        do {
            let destinations = try await tripService.getDestinations()
            self.recentDestinations = Array(destinations.prefix(3))
        } catch {
            print("Failed to load destinations: \(error)")
        }
    }

    func refreshData() {
        loadData()
    }
}

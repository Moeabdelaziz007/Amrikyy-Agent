import Foundation

/// Trip service for managing travel plans
class TripService {
    static let shared = TripService()
    
    private let api = APIService.shared
    private var cachedTrips: [TravelPlan] = []
    
    private init() {}
    
    // MARK: - Trip CRUD Operations
    
    func getTrips(userId: String? = nil) async throws -> [TravelPlan] {
        // TODO: Implement backend integration
        // For now, return mock data
        let mockTrips = [
            TravelPlan(
                id: "1",
                destination: "Tokyo, Japan",
                startDate: Date().addingTimeInterval(86400 * 30),
                endDate: Date().addingTimeInterval(86400 * 37),
                budget: 2500,
                travelers: 2,
                status: .planned,
                description: "Explore the vibrant city of Tokyo",
                activities: [
                    Activity(
                        name: "Visit Tokyo Tower",
                        description: "Iconic landmark with amazing views",
                        category: .sightseeing,
                        cost: 30
                    ),
                    Activity(
                        name: "Sushi Dinner",
                        description: "Authentic sushi experience",
                        category: .dining,
                        cost: 150
                    )
                ],
                expenses: [
                    Expense(
                        amount: 500,
                        category: .accommodation,
                        description: "Hotel booking deposit"
                    )
                ]
            ),
            TravelPlan(
                id: "2",
                destination: "Paris, France",
                startDate: Date().addingTimeInterval(86400 * 60),
                endDate: Date().addingTimeInterval(86400 * 65),
                budget: 3000,
                travelers: 2,
                status: .draft,
                description: "Romantic getaway to the City of Light"
            )
        ]
        
        cachedTrips = mockTrips
        return mockTrips
    }
    
    func getTrip(id: String) async throws -> TravelPlan? {
        // Check cache first
        if let trip = cachedTrips.first(where: { $0.id == id }) {
            return trip
        }
        
        // TODO: Fetch from backend
        return nil
    }
    
    func createTrip(_ trip: TravelPlan) async throws -> TravelPlan {
        // TODO: Implement backend integration
        cachedTrips.append(trip)
        return trip
    }
    
    func updateTrip(_ trip: TravelPlan) async throws -> TravelPlan {
        // TODO: Implement backend integration
        if let index = cachedTrips.firstIndex(where: { $0.id == trip.id }) {
            cachedTrips[index] = trip
        }
        return trip
    }
    
    func deleteTrip(id: String) async throws {
        // TODO: Implement backend integration
        cachedTrips.removeAll { $0.id == id }
    }
    
    // MARK: - Activities
    
    func addActivity(to tripId: String, activity: Activity) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].activities.append(activity)
        }
    }
    
    func removeActivity(from tripId: String, activityId: String) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].activities.removeAll { $0.id == activityId }
        }
    }
    
    // MARK: - Expenses
    
    func addExpense(to tripId: String, expense: Expense) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].expenses.append(expense)
        }
    }
    
    func removeExpense(from tripId: String, expenseId: String) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].expenses.removeAll { $0.id == expenseId }
        }
    }
    
    // MARK: - Destinations
    
    func getDestinations() async throws -> [Destination] {
        // TODO: Implement backend integration
        // For now, return mock data
        return [
            Destination(
                name: "Tokyo",
                country: "Japan",
                description: "A vibrant metropolis blending ultra-modern and traditional culture",
                rating: 4.8,
                averageCost: 150
            ),
            Destination(
                name: "Paris",
                country: "France",
                description: "The City of Light, known for art, fashion, and romance",
                rating: 4.9,
                averageCost: 200
            ),
            Destination(
                name: "Bali",
                country: "Indonesia",
                description: "Tropical paradise with stunning beaches and rich culture",
                rating: 4.7,
                averageCost: 80
            ),
            Destination(
                name: "Dubai",
                country: "UAE",
                description: "Luxurious desert city with world-class shopping and architecture",
                rating: 4.6,
                averageCost: 180
            ),
            Destination(
                name: "New York",
                country: "USA",
                description: "The city that never sleeps, a global hub of culture and finance",
                rating: 4.7,
                averageCost: 220
            )
        ]
    }
    
    func getDestination(id: String) async throws -> Destination? {
        let destinations = try await getDestinations()
        return destinations.first { $0.id == id }
    }
}


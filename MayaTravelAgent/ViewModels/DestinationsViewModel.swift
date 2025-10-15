import Foundation
import Combine

/// DestinationsViewModel manages destinations data with reactive Combine publishers
/// Follows MVVM architecture with proper separation of concerns
class DestinationsViewModel: BaseViewModel {
    // MARK: - Published Properties

    /// All destinations loaded from API
    @Published var destinations: [Destination] = []

    /// Filtered destinations based on search and category filters
    @Published var filteredDestinations: [Destination] = []

    /// Loading state for UI feedback
    @Published var isLoading = false

    /// Error message for UI display
    @Published var error: String?

    /// Search text for real-time filtering
    @Published var searchText = ""

    /// Selected category filter
    @Published var selectedCategory: String?

    /// Set of favorite destination IDs (persistent)
    @Published var favoriteDestinationIds: Set<String> = []

    // MARK: - Private Properties

    private var cancellables = Set<AnyCancellable>()
    private let apiService = APIService.shared
    private let favoritesKey = "favoriteDestinationIds"

    // MARK: - Initialization

    override init() {
        super.init()
        setupBindings()
        loadFavorites()
        loadDestinations()
    }

    // MARK: - Setup Methods

    /// Sets up Combine bindings for reactive data flow
    private func setupBindings() {
        // Combine search text and category filter for real-time filtering
        Publishers.CombineLatest($searchText, $selectedCategory)
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] _, _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)
    }

    // MARK: - Data Loading

    /// Loads destinations from API
    func loadDestinations() {
        Task {
            await fetchDestinations()
        }
    }

    /// Fetches destinations from API with error handling
    @MainActor
    private func fetchDestinations() async {
        isLoading = true
        error = nil

        do {
            // TODO: Replace with actual API call when backend is ready
            // For now, using mock data
            let mockDestinations = createMockDestinations()
            destinations = mockDestinations
            applyFilters()
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Filtering Logic

    /// Applies search and category filters to destinations
    private func applyFilters() {
        var results = destinations

        // Apply search filter
        if !searchText.isEmpty {
            results = results.filter { destination in
                destination.name.localizedCaseInsensitiveContains(searchText) ||
                destination.country.localizedCaseInsensitiveContains(searchText) ||
                (destination.description?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }

        // Apply category filter
        if let category = selectedCategory, category != "All" {
            results = results.filter { destination in
                getCategory(for: destination.country) == category
            }
        }

        filteredDestinations = results
    }

    /// Determines category based on country
    private func getCategory(for country: String) -> String {
        let categories: [String: [String]] = [
            "Asia": ["Japan", "China", "Thailand", "Vietnam", "Singapore", "South Korea", "India", "Indonesia", "Malaysia", "Philippines"],
            "Europe": ["France", "Italy", "Spain", "Germany", "UK", "Switzerland", "Netherlands", "Austria", "Greece", "Portugal"],
            "Americas": ["USA", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Peru", "Colombia"],
            "Africa": ["South Africa", "Egypt", "Morocco", "Kenya", "Tanzania", "Tunisia"],
            "Oceania": ["Australia", "New Zealand", "Fiji"]
        ]

        for (category, countries) in categories {
            if countries.contains(country) {
                return category
            }
        }

        return "Other"
    }

    // MARK: - Favorites Management

    /// Toggles favorite status for a destination
    /// - Parameter destinationId: The ID of the destination to toggle
    func toggleFavorite(destinationId: String) {
        if favoriteDestinationIds.contains(destinationId) {
            favoriteDestinationIds.remove(destinationId)
        } else {
            favoriteDestinationIds.insert(destinationId)
        }
        saveFavorites()
    }

    /// Checks if a destination is favorited
    /// - Parameter destinationId: The ID of the destination to check
    /// - Returns: True if the destination is favorited
    func isFavorite(destinationId: String) -> Bool {
        favoriteDestinationIds.contains(destinationId)
    }

    /// Loads favorite destination IDs from UserDefaults
    private func loadFavorites() {
        if let data = UserDefaults.standard.data(forKey: favoritesKey),
           let favorites = try? JSONDecoder().decode(Set<String>.self, from: data) {
            favoriteDestinationIds = favorites
        }
    }

    /// Saves favorite destination IDs to UserDefaults
    private func saveFavorites() {
        if let data = try? JSONEncoder().encode(favoriteDestinationIds) {
            UserDefaults.standard.set(data, forKey: favoritesKey)
        }
    }

    // MARK: - CRUD Operations

    /// Creates a new destination
    /// - Parameter destination: The destination to create
    func createDestination(_ destination: Destination) {
        // Validate input
        guard validateDestination(destination) else {
            error = "Invalid destination data"
            return
        }

        // TODO: Implement API call when backend is ready
        destinations.append(destination)
        applyFilters()
    }

    /// Updates an existing destination
    /// - Parameters:
    ///   - id: The ID of the destination to update
    ///   - updatedDestination: The updated destination data
    func updateDestination(id: String, updatedDestination: Destination) {
        // Validate input
        guard validateDestination(updatedDestination) else {
            error = "Invalid destination data"
            return
        }

        // TODO: Implement API call when backend is ready
        if let index = destinations.firstIndex(where: { $0.id == id }) {
            destinations[index] = updatedDestination
            applyFilters()
        }
    }

    /// Deletes a destination
    /// - Parameter id: The ID of the destination to delete
    func deleteDestination(id: String) {
        // TODO: Implement API call when backend is ready
        destinations.removeAll { $0.id == id }
        applyFilters()
        favoriteDestinationIds.remove(id)
        saveFavorites()
    }

    // MARK: - Validation

    /// Validates destination data
    /// - Parameter destination: The destination to validate
    /// - Returns: True if the destination is valid
    private func validateDestination(_ destination: Destination) -> Bool {
        !destination.name.isEmpty &&
        !destination.country.isEmpty &&
        destination.rating >= 0 && destination.rating <= 5 &&
        (destination.averageCost ?? 0) >= 0
    }

    // MARK: - Utility Methods

    /// Refreshes destinations data
    func refreshDestinations() {
        loadDestinations()
    }

    /// Gets favorite destinations
    /// - Returns: Array of favorite destinations
    func getFavoriteDestinations() -> [Destination] {
        destinations.filter { favoriteDestinationIds.contains($0.id) }
    }

    // MARK: - Mock Data (Temporary)

    /// Creates mock destinations for development
    private func createMockDestinations() -> [Destination] {
        [
            Destination(
                name: "Tokyo",
                country: "Japan",
                description: "Vibrant metropolis blending tradition and modernity",
                imageUrl: "https://example.com/tokyo.jpg",
                rating: 4.8,
                popularityScore: 95,
                bestTimeToVisit: "March-May",
                averageCost: 2500,
                currency: "JPY"
            ),
            Destination(
                name: "Paris",
                country: "France",
                description: "City of lights and romance",
                imageUrl: "https://example.com/paris.jpg",
                rating: 4.9,
                popularityScore: 98,
                bestTimeToVisit: "April-June",
                averageCost: 1800,
                currency: "EUR"
            ),
            Destination(
                name: "New York",
                country: "USA",
                description: "The city that never sleeps",
                imageUrl: "https://example.com/nyc.jpg",
                rating: 4.7,
                popularityScore: 92,
                bestTimeToVisit: "May-September",
                averageCost: 2200,
                currency: "USD"
            )
        ]
    }
}


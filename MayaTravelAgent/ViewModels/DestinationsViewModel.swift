import Foundation
import Combine

class DestinationsViewModel: BaseViewModel {
    @Published var destinations: [Destination] = []
    @Published var filteredDestinations: [Destination] = []
    @Published var searchText: String = ""
    @Published var selectedFilter: DestinationFilter = .all
    @Published var sortBy: SortOption = .popularity
    
    private let tripService = TripService.shared
    
    enum DestinationFilter: String, CaseIterable {
        case all = "All"
        case asia = "Asia"
        case europe = "Europe"
        case americas = "Americas"
        case africa = "Africa"
        case oceania = "Oceania"
        
        var displayName: String { rawValue }
    }
    
    enum SortOption: String, CaseIterable {
        case popularity = "Popularity"
        case priceAsc = "Price (Low to High)"
        case priceDesc = "Price (High to Low)"
        case rating = "Rating"
        case name = "Name"
        
        var displayName: String { rawValue }
    }
    
    override init() {
        super.init()
        setupBindings()
        loadDestinations()
    }
    
    private func setupBindings() {
        // Update filtered destinations when search text or filter changes
        Publishers.CombineLatest3($searchText, $selectedFilter, $sortBy)
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] _, _, _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)
    }
    
    func loadDestinations() {
        Task {
            await fetchDestinations()
        }
    }
    
    @MainActor
    private func fetchDestinations() async {
        setLoading(true)
        
        do {
            let fetchedDestinations = try await tripService.getDestinations()
            self.destinations = fetchedDestinations
            applyFilters()
            setLoading(false)
        } catch {
            handleError(error)
        }
    }
    
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
        
        // Apply region filter
        if selectedFilter != .all {
            results = results.filter { destination in
                getRegion(for: destination.country) == selectedFilter
            }
        }
        
        // Apply sorting
        switch sortBy {
        case .popularity:
            results.sort { ($0.popularityScore ?? 0) > ($1.popularityScore ?? 0) }
        case .priceAsc:
            results.sort { ($0.averageCost ?? 0) < ($1.averageCost ?? 0) }
        case .priceDesc:
            results.sort { ($0.averageCost ?? 0) > ($1.averageCost ?? 0) }
        case .rating:
            results.sort { ($0.rating ?? 0) > ($1.rating ?? 0) }
        case .name:
            results.sort { $0.name < $1.name }
        }
        
        filteredDestinations = results
    }
    
    private func getRegion(for country: String) -> DestinationFilter {
        let asianCountries = ["Japan", "China", "Thailand", "Vietnam", "Singapore", "South Korea", "India", "Indonesia", "Malaysia", "Philippines"]
        let europeanCountries = ["France", "Italy", "Spain", "Germany", "UK", "Switzerland", "Netherlands", "Austria", "Greece", "Portugal"]
        let americanCountries = ["USA", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Peru", "Colombia"]
        let africanCountries = ["South Africa", "Egypt", "Morocco", "Kenya", "Tanzania", "Tunisia"]
        let oceaniaCountries = ["Australia", "New Zealand", "Fiji"]
        
        if asianCountries.contains(country) { return .asia }
        if europeanCountries.contains(country) { return .europe }
        if americanCountries.contains(country) { return .americas }
        if africanCountries.contains(country) { return .africa }
        if oceaniaCountries.contains(country) { return .oceania }
        
        return .all
    }
    
    func refreshDestinations() {
        loadDestinations()
    }
}


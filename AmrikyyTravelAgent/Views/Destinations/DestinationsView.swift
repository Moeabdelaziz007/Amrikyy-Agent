import SwiftUI
import Combine
import MapKit
import SDWebImageSwiftUI

// MARK: - Destinations ViewModel
class DestinationsViewModel: ObservableObject {
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    
    // Destinations Data
    @Published var destinations: [Destination] = []
    @Published var featuredDestinations: [Destination] = []
    @Published var popularDestinations: [Destination] = []
    @Published var nearbyDestinations: [Destination] = []
    @Published var favoriteDestinations: [Destination] = []
    
    // Search and Filtering
    @Published var searchText: String = ""
    @Published var selectedRegion: Region = .all
    @Published var selectedCategory: DestinationCategory = .all
    @Published var priceRange: PriceRange = .all
    @Published var ratingFilter: Double = 0.0
    @Published var isSearching: Bool = false
    
    // Map Integration
    @Published var selectedDestination: Destination?
    @Published var mapRegion: MKCoordinateRegion = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    @Published var showMapView: Bool = false
    
    // User Location
    @Published var userLocation: CLLocation?
    @Published var locationPermissionGranted: Bool = false
    
    // Sorting and Display
    @Published var sortOption: SortOption = .popularity
    @Published var viewMode: ViewMode = .grid
    @Published var showFavoritesOnly: Bool = false
    
    // Pagination
    @Published var currentPage: Int = 1
    @Published var hasMorePages: Bool = true
    @Published var isLoadingMore: Bool = false
    
    // Filtered Results
    @Published var filteredDestinations: [Destination] = []
    
    private let destinationService = DestinationService.shared
    private let locationManager = CLLocationManager()
    private var cancellables = Set<AnyCancellable>()
    private var searchCancellable: AnyCancellable?
    
    init() {
        setupLocationManager()
        setupSearch()
        setupFiltering()
        loadDestinations()
    }
    
    private func setupLocationManager() {
        locationManager.delegate = LocationManagerDelegate(viewModel: self)
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.requestWhenInUseAuthorization()
    }
    
    private func setupSearch() {
        $searchText
            .debounce(for: .milliseconds(500), scheduler: RunLoop.main)
            .removeDuplicates()
            .sink { [weak self] searchText in
                self?.performSearch(searchText)
            }
            .store(in: &cancellables)
    }
    
    private func setupFiltering() {
        Publishers.CombineLatest4(
            $destinations,
            $searchText,
            $selectedRegion,
            $selectedCategory
        )
        .combineLatest(
            Publishers.CombineLatest4(
                $priceRange,
                $ratingFilter,
                $showFavoritesOnly,
                $sortOption
            )
        )
        .map { [weak self] destinations, searchText, region, category, priceRange, rating, favoritesOnly, sortOption in
            self?.filterDestinations(
                destinations: destinations,
                searchText: searchText,
                region: region,
                category: category,
                priceRange: priceRange,
                rating: rating,
                favoritesOnly: favoritesOnly,
                sortOption: sortOption
            ) ?? []
        }
        .assign(to: \.filteredDestinations, on: self)
        .store(in: &cancellables)
    }
    
    func loadDestinations() {
        isLoading = true
        errorMessage = nil
        
        destinationService.fetchDestinations(page: currentPage)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleDestinationsResponse(response)
                }
            )
            .store(in: &cancellables)
    }
    
    func loadMoreDestinations() {
        guard hasMorePages && !isLoadingMore else { return }
        
        isLoadingMore = true
        currentPage += 1
        
        destinationService.fetchDestinations(page: currentPage)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoadingMore = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                        self?.currentPage -= 1 // Revert page increment on error
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleMoreDestinationsResponse(response)
                }
            )
            .store(in: &cancellables)
    }
    
    func loadFeaturedDestinations() {
        destinationService.fetchFeaturedDestinations()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] destinations in
                    self?.featuredDestinations = destinations
                }
            )
            .store(in: &cancellables)
    }
    
    func loadPopularDestinations() {
        destinationService.fetchPopularDestinations()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] destinations in
                    self?.popularDestinations = destinations
                }
            )
            .store(in: &cancellables)
    }
    
    func loadNearbyDestinations() {
        guard let location = userLocation else { return }
        
        destinationService.fetchNearbyDestinations(
            latitude: location.coordinate.latitude,
            longitude: location.coordinate.longitude,
            radius: 100 // 100km radius
        )
        .receive(on: DispatchQueue.main)
        .sink(
            receiveCompletion: { _ in },
            receiveValue: { [weak self] destinations in
                self?.nearbyDestinations = destinations
            }
        )
        .store(in: &cancellables)
    }
    
    func loadFavoriteDestinations() {
        destinationService.fetchFavoriteDestinations()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] destinations in
                    self?.favoriteDestinations = destinations
                }
            )
            .store(in: &cancellables)
    }
    
    func toggleFavorite(_ destination: Destination) {
        let isCurrentlyFavorite = favoriteDestinations.contains { $0.id == destination.id }
        
        if isCurrentlyFavorite {
            removeFromFavorites(destination)
        } else {
            addToFavorites(destination)
        }
    }
    
    private func addToFavorites(_ destination: Destination) {
        destinationService.addToFavorites(destinationId: destination.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.favoriteDestinations.append(destination)
                    self?.successMessage = "Added to favorites!"
                }
            )
            .store(in: &cancellables)
    }
    
    private func removeFromFavorites(_ destination: Destination) {
        destinationService.removeFromFavorites(destinationId: destination.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.favoriteDestinations.removeAll { $0.id == destination.id }
                    self?.successMessage = "Removed from favorites!"
                }
            )
            .store(in: &cancellables)
    }
    
    func refreshDestinations() {
        currentPage = 1
        hasMorePages = true
        destinations.removeAll()
        loadDestinations()
    }
    
    func selectDestination(_ destination: Destination) {
        selectedDestination = destination
        mapRegion = MKCoordinateRegion(
            center: CLLocationCoordinate2D(
                latitude: destination.latitude,
                longitude: destination.longitude
            ),
            span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
        )
    }
    
    func requestLocationPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func updateUserLocation() {
        guard locationPermissionGranted else { return }
        locationManager.requestLocation()
    }
    
    private func performSearch(_ searchText: String) {
        guard !searchText.isEmpty else {
            isSearching = false
            return
        }
        
        isSearching = true
        
        destinationService.searchDestinations(query: searchText)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isSearching = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] destinations in
                    self?.destinations = destinations
                }
            )
            .store(in: &cancellables)
    }
    
    private func filterDestinations(
        destinations: [Destination],
        searchText: String,
        region: Region,
        category: DestinationCategory,
        priceRange: PriceRange,
        rating: Double,
        favoritesOnly: Bool,
        sortOption: SortOption
    ) -> [Destination] {
        var filtered = destinations
        
        // Apply search filter
        if !searchText.isEmpty {
            filtered = filtered.filter { destination in
                destination.name.localizedCaseInsensitiveContains(searchText) ||
                destination.description.localizedCaseInsensitiveContains(searchText) ||
                destination.country.localizedCaseInsensitiveContains(searchText) ||
                destination.city.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Apply region filter
        if region != .all {
            filtered = filtered.filter { $0.region == region }
        }
        
        // Apply category filter
        if category != .all {
            filtered = filtered.filter { $0.category == category }
        }
        
        // Apply price range filter
        if priceRange != .all {
            filtered = filtered.filter { destination in
                switch priceRange {
                case .budget:
                    return destination.averageCost < 100
                case .midRange:
                    return destination.averageCost >= 100 && destination.averageCost < 300
                case .luxury:
                    return destination.averageCost >= 300
                case .all:
                    return true
                }
            }
        }
        
        // Apply rating filter
        if rating > 0 {
            filtered = filtered.filter { $0.rating >= rating }
        }
        
        // Apply favorites filter
        if favoritesOnly {
            let favoriteIds = Set(favoriteDestinations.map { $0.id })
            filtered = filtered.filter { favoriteIds.contains($0.id) }
        }
        
        // Apply sorting
        filtered = sortDestinations(filtered, by: sortOption)
        
        return filtered
    }
    
    private func sortDestinations(_ destinations: [Destination], by option: SortOption) -> [Destination] {
        switch option {
        case .popularity:
            return destinations.sorted { $0.popularityScore > $1.popularityScore }
        case .rating:
            return destinations.sorted { $0.rating > $1.rating }
        case .priceLowToHigh:
            return destinations.sorted { $0.averageCost < $1.averageCost }
        case .priceHighToLow:
            return destinations.sorted { $0.averageCost > $1.averageCost }
        case .distance:
            guard let userLocation = userLocation else { return destinations }
            return destinations.sorted { destination1, destination2 in
                let location1 = CLLocation(latitude: destination1.latitude, longitude: destination1.longitude)
                let location2 = CLLocation(latitude: destination2.latitude, longitude: destination2.longitude)
                return userLocation.distance(from: location1) < userLocation.distance(from: location2)
            }
        case .name:
            return destinations.sorted { $0.name < $1.name }
        }
    }
    
    private func handleDestinationsResponse(_ response: DestinationsResponse) {
        destinations = response.destinations
        hasMorePages = response.hasMorePages
    }
    
    private func handleMoreDestinationsResponse(_ response: DestinationsResponse) {
        destinations.append(contentsOf: response.destinations)
        hasMorePages = response.hasMorePages
    }
}

// MARK: - Location Manager Delegate
class LocationManagerDelegate: NSObject, CLLocationManagerDelegate {
    weak var viewModel: DestinationsViewModel?
    
    init(viewModel: DestinationsViewModel) {
        self.viewModel = viewModel
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        viewModel?.userLocation = location
        viewModel?.loadNearbyDestinations()
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        switch status {
        case .authorizedWhenInUse, .authorizedAlways:
            viewModel?.locationPermissionGranted = true
            manager.requestLocation()
        case .denied, .restricted:
            viewModel?.locationPermissionGranted = false
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        @unknown default:
            break
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
    }
}

// MARK: - Models
enum Region: String, CaseIterable, Codable {
    case all = "all"
    case northAmerica = "north_america"
    case southAmerica = "south_america"
    case europe = "europe"
    case asia = "asia"
    case africa = "africa"
    case oceania = "oceania"
    case middleEast = "middle_east"
    
    var displayName: String {
        switch self {
        case .all: return "All Regions"
        case .northAmerica: return "North America"
        case .southAmerica: return "South America"
        case .europe: return "Europe"
        case .asia: return "Asia"
        case .africa: return "Africa"
        case .oceania: return "Oceania"
        case .middleEast: return "Middle East"
        }
    }
    
    var icon: String {
        switch self {
        case .all: return "globe"
        case .northAmerica: return "map"
        case .southAmerica: return "map"
        case .europe: return "map"
        case .asia: return "map"
        case .africa: return "map"
        case .oceania: return "map"
        case .middleEast: return "map"
        }
    }
}

enum DestinationCategory: String, CaseIterable, Codable {
    case all = "all"
    case beaches = "beaches"
    case mountains = "mountains"
    case cities = "cities"
    case culture = "culture"
    case nature = "nature"
    case adventure = "adventure"
    case relaxation = "relaxation"
    case food = "food"
    case history = "history"
    
    var displayName: String {
        switch self {
        case .all: return "All Categories"
        case .beaches: return "Beaches"
        case .mountains: return "Mountains"
        case .cities: return "Cities"
        case .culture: return "Culture"
        case .nature: return "Nature"
        case .adventure: return "Adventure"
        case .relaxation: return "Relaxation"
        case .food: return "Food"
        case .history: return "History"
        }
    }
    
    var icon: String {
        switch self {
        case .all: return "square.grid.2x2"
        case .beaches: return "beach.umbrella"
        case .mountains: return "mountain.2"
        case .cities: return "building.2"
        case .culture: return "building.columns"
        case .nature: return "leaf"
        case .adventure: return "figure.hiking"
        case .relaxation: return "spa"
        case .food: return "fork.knife"
        case .history: return "book"
        }
    }
}

enum PriceRange: String, CaseIterable, Codable {
    case all = "all"
    case budget = "budget"
    case midRange = "mid_range"
    case luxury = "luxury"
    
    var displayName: String {
        switch self {
        case .all: return "All Prices"
        case .budget: return "Budget (<$100/day)"
        case .midRange: return "Mid-range ($100-300/day)"
        case .luxury: return "Luxury ($300+/day)"
        }
    }
}

enum SortOption: String, CaseIterable, Codable {
    case popularity = "popularity"
    case rating = "rating"
    case priceLowToHigh = "price_low_high"
    case priceHighToLow = "price_high_low"
    case distance = "distance"
    case name = "name"
    
    var displayName: String {
        switch self {
        case .popularity: return "Popularity"
        case .rating: return "Rating"
        case .priceLowToHigh: return "Price: Low to High"
        case .priceHighToLow: return "Price: High to Low"
        case .distance: return "Distance"
        case .name: return "Name"
        }
    }
}

enum ViewMode: String, CaseIterable {
    case grid = "grid"
    case list = "list"
    case map = "map"
    
    var displayName: String {
        switch self {
        case .grid: return "Grid"
        case .list: return "List"
        case .map: return "Map"
        }
    }
    
    var icon: String {
        switch self {
        case .grid: return "square.grid.2x2"
        case .list: return "list.bullet"
        case .map: return "map"
        }
    }
}

struct DestinationsResponse: Codable {
    let destinations: [Destination]
    let hasMorePages: Bool
    let totalCount: Int
}

// MARK: - Destination Service
class DestinationService: ObservableObject {
    static let shared = DestinationService()
    
    private let apiService = APIService.shared
    
    private init() {}
    
    func fetchDestinations(page: Int = 1, limit: Int = 20) -> AnyPublisher<DestinationsResponse, Error> {
        return apiService.get("/api/destinations?page=\(page)&limit=\(limit)")
            .map { (data: Data) in
                try JSONDecoder().decode(DestinationsResponse.self, from: data)
            }
            .eraseToAnyPublisher()
    }
    
    func fetchFeaturedDestinations() -> AnyPublisher<[Destination], Error> {
        return apiService.get("/api/destinations/featured")
            .map { (data: Data) in
                let response = try JSONDecoder().decode([Destination].self, from: data)
                return response
            }
            .eraseToAnyPublisher()
    }
    
    func fetchPopularDestinations() -> AnyPublisher<[Destination], Error> {
        return apiService.get("/api/destinations/popular")
            .map { (data: Data) in
                let response = try JSONDecoder().decode([Destination].self, from: data)
                return response
            }
            .eraseToAnyPublisher()
    }
    
    func fetchNearbyDestinations(latitude: Double, longitude: Double, radius: Int) -> AnyPublisher<[Destination], Error> {
        return apiService.get("/api/destinations/nearby?lat=\(latitude)&lng=\(longitude)&radius=\(radius)")
            .map { (data: Data) in
                let response = try JSONDecoder().decode([Destination].self, from: data)
                return response
            }
            .eraseToAnyPublisher()
    }
    
    func fetchFavoriteDestinations() -> AnyPublisher<[Destination], Error> {
        return apiService.get("/api/destinations/favorites")
            .map { (data: Data) in
                let response = try JSONDecoder().decode([Destination].self, from: data)
                return response
            }
            .eraseToAnyPublisher()
    }
    
    func searchDestinations(query: String) -> AnyPublisher<[Destination], Error> {
        return apiService.get("/api/destinations/search?q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")")
            .map { (data: Data) in
                let response = try JSONDecoder().decode([Destination].self, from: data)
                return response
            }
            .eraseToAnyPublisher()
    }
    
    func addToFavorites(destinationId: String) -> AnyPublisher<Void, Error> {
        return apiService.post("/api/destinations/\(destinationId)/favorite", body: [:])
            .map { _ in () }
            .eraseToAnyPublisher()
    }
    
    func removeFromFavorites(destinationId: String) -> AnyPublisher<Void, Error> {
        return apiService.delete("/api/destinations/\(destinationId)/favorite")
            .map { _ in () }
            .eraseToAnyPublisher()
    }
}

// MARK: - Destinations View
struct DestinationsView: View {
    @StateObject private var viewModel = DestinationsViewModel()
    @EnvironmentObject var navigationCoordinator: NavigationCoordinator
    @State private var showingFilters = false
    @State private var showingMap = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                searchBarSection
                
                // Filter Bar
                filterBarSection
                
                // Content
                if viewModel.showMapView {
                    mapViewSection
                } else {
                    destinationsContentSection
                }
            }
            .navigationTitle("Destinations")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { showingFilters = true }) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        ForEach(ViewMode.allCases, id: \.self) { mode in
                            Button(action: { viewModel.viewMode = mode }) {
                                Label(mode.displayName, systemImage: mode.icon)
                            }
                        }
                    } label: {
                        Image(systemName: viewModel.viewMode.icon)
                    }
                }
            }
            .sheet(isPresented: $showingFilters) {
                FiltersView(viewModel: viewModel)
            }
            .sheet(isPresented: $showingMap) {
                MapView(viewModel: viewModel)
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                if let error = viewModel.errorMessage {
                    Text(error)
                }
            }
            .alert("Success", isPresented: .constant(viewModel.successMessage != nil)) {
                Button("OK") {
                    viewModel.successMessage = nil
                }
            } message: {
                if let message = viewModel.successMessage {
                    Text(message)
                }
            }
        }
        .onAppear {
            viewModel.loadDestinations()
            viewModel.loadFeaturedDestinations()
            viewModel.loadPopularDestinations()
            viewModel.loadFavoriteDestinations()
        }
    }
    
    // MARK: - Search Bar Section
    private var searchBarSection: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search destinations...", text: $viewModel.searchText)
                .textFieldStyle(PlainTextFieldStyle())
            
            if !viewModel.searchText.isEmpty {
                Button(action: { viewModel.searchText = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
    
    // MARK: - Filter Bar Section
    private var filterBarSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                FilterChip(
                    title: "All",
                    isSelected: viewModel.selectedRegion == .all && viewModel.selectedCategory == .all
                ) {
                    viewModel.selectedRegion = .all
                    viewModel.selectedCategory = .all
                }
                
                ForEach(Region.allCases.filter { $0 != .all }, id: \.self) { region in
                    FilterChip(
                        title: region.displayName,
                        isSelected: viewModel.selectedRegion == region
                    ) {
                        viewModel.selectedRegion = region
                    }
                }
                
                ForEach(DestinationCategory.allCases.filter { $0 != .all }, id: \.self) { category in
                    FilterChip(
                        title: category.displayName,
                        isSelected: viewModel.selectedCategory == category
                    ) {
                        viewModel.selectedCategory = category
                    }
                }
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Destinations Content Section
    private var destinationsContentSection: some View {
        Group {
            if viewModel.isLoading && viewModel.destinations.isEmpty {
                ProgressView("Loading destinations...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.filteredDestinations.isEmpty {
                emptyStateView
            } else {
                destinationsListView
            }
        }
    }
    
    // MARK: - Destinations List View
    private var destinationsListView: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                // Featured Destinations
                if !viewModel.featuredDestinations.isEmpty {
                    featuredDestinationsSection
                }
                
                // All Destinations
                ForEach(viewModel.filteredDestinations) { destination in
                    DestinationCard(
                        destination: destination,
                        isFavorite: viewModel.favoriteDestinations.contains { $0.id == destination.id },
                        onFavoriteToggle: {
                            viewModel.toggleFavorite(destination)
                        },
                        onTap: {
                            viewModel.selectDestination(destination)
                            navigationCoordinator.goToDestination(destination)
                        }
                    )
                }
                
                // Load More Button
                if viewModel.hasMorePages {
                    Button(action: viewModel.loadMoreDestinations) {
                        HStack {
                            if viewModel.isLoadingMore {
                                ProgressView()
                                    .scaleEffect(0.8)
                            } else {
                                Image(systemName: "arrow.down.circle")
                            }
                            Text(viewModel.isLoadingMore ? "Loading..." : "Load More")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                    }
                    .disabled(viewModel.isLoadingMore)
                }
            }
            .padding()
        }
        .refreshable {
            viewModel.refreshDestinations()
        }
    }
    
    // MARK: - Featured Destinations Section
    private var featuredDestinationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Featured Destinations")
                .font(.headline)
                .fontWeight(.semibold)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.featuredDestinations) { destination in
                        FeaturedDestinationCard(destination: destination) {
                            viewModel.selectDestination(destination)
                            navigationCoordinator.goToDestination(destination)
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
    }
    
    // MARK: - Map View Section
    private var mapViewSection: some View {
        MapView(viewModel: viewModel)
    }
    
    // MARK: - Empty State View
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "map")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No destinations found")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Try adjusting your search or filters")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Clear Filters") {
                viewModel.selectedRegion = .all
                viewModel.selectedCategory = .all
                viewModel.priceRange = .all
                viewModel.ratingFilter = 0.0
                viewModel.showFavoritesOnly = false
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - Supporting Views
struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.blue : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct DestinationCard: View {
    let destination: Destination
    let isFavorite: Bool
    let onFavoriteToggle: () -> Void
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                // Image with caching
                WebImage(url: URL(string: destination.imageURL))
                    .onSuccess { image, data, cacheType in
                        // Image loaded successfully
                    }
                    .resizable()
                    .placeholder {
                        Rectangle()
                            .fill(Color(.systemGray5))
                            .overlay(
                                Image(systemName: "photo")
                                    .foregroundColor(.gray)
                            )
                    }
                    .indicator(.activity)
                    .transition(.fade(duration: 0.3))
                    .aspectRatio(contentMode: .fill)
                .frame(height: 200)
                .cornerRadius(12)
                .overlay(
                    Button(action: onFavoriteToggle) {
                        Image(systemName: isFavorite ? "heart.fill" : "heart")
                            .foregroundColor(isFavorite ? .red : .white)
                            .font(.title2)
                    }
                    .padding(8)
                    .background(Color.black.opacity(0.3))
                    .cornerRadius(8),
                    alignment: .topTrailing
                )
                
                // Content
                VStack(alignment: .leading, spacing: 8) {
                    Text(destination.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .lineLimit(2)
                    
                    Text("\(destination.city), \(destination.country)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)
                                .font(.caption)
                            Text(String(format: "%.1f", destination.rating))
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        
                        Spacer()
                        
                        Text("$\(Int(destination.averageCost))/day")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.blue)
                    }
                    
                    Text(destination.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct FeaturedDestinationCard: View {
    let destination: Destination
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 8) {
                AsyncImage(url: URL(string: destination.imageURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color(.systemGray5))
                }
                .frame(width: 200, height: 120)
                .cornerRadius(8)
                
                Text(destination.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(2)
                
                Text("\(destination.city), \(destination.country)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .buttonStyle(PlainButtonStyle())
        .frame(width: 200)
    }
}

struct FiltersView: View {
    @ObservedObject var viewModel: DestinationsViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section("Region") {
                    Picker("Region", selection: $viewModel.selectedRegion) {
                        ForEach(Region.allCases, id: \.self) { region in
                            Text(region.displayName).tag(region)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section("Category") {
                    Picker("Category", selection: $viewModel.selectedCategory) {
                        ForEach(DestinationCategory.allCases, id: \.self) { category in
                            Text(category.displayName).tag(category)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section("Price Range") {
                    Picker("Price Range", selection: $viewModel.priceRange) {
                        ForEach(PriceRange.allCases, id: \.self) { range in
                            Text(range.displayName).tag(range)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section("Rating") {
                    VStack(alignment: .leading) {
                        Text("Minimum Rating: \(String(format: "%.1f", viewModel.ratingFilter))")
                        Slider(value: $viewModel.ratingFilter, in: 0...5, step: 0.1)
                    }
                }
                
                Section("Sort By") {
                    Picker("Sort By", selection: $viewModel.sortOption) {
                        ForEach(SortOption.allCases, id: \.self) { option in
                            Text(option.displayName).tag(option)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section("Other") {
                    Toggle("Favorites Only", isOn: $viewModel.showFavoritesOnly)
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Apply") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct MapView: View {
    @ObservedObject var viewModel: DestinationsViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Map(coordinateRegion: $viewModel.mapRegion, annotationItems: viewModel.filteredDestinations) { destination in
                MapAnnotation(coordinate: CLLocationCoordinate2D(latitude: destination.latitude, longitude: destination.longitude)) {
                    Button(action: {
                        viewModel.selectDestination(destination)
                    }) {
                        VStack {
                            Image(systemName: "mappin.circle.fill")
                                .font(.title)
                                .foregroundColor(.red)
                            
                            Text(destination.name)
                                .font(.caption)
                                .fontWeight(.medium)
                                .padding(4)
                                .background(Color.white)
                                .cornerRadius(4)
                                .shadow(radius: 2)
                        }
                    }
                }
            }
            .navigationTitle("Map View")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Preview
struct DestinationsView_Previews: PreviewProvider {
    static var previews: some View {
        DestinationsView()
            .environmentObject(NavigationCoordinator())
    }
}
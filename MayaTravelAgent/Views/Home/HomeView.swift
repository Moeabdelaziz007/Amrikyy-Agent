import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject var authService: AuthService
    @EnvironmentObject var navigationCoordinator: NavigationCoordinator

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Welcome Header
                welcomeHeader
                
                // Quick Stats
                quickStatsCard
                
                // Upcoming Trips
                if !viewModel.upcomingTrips.isEmpty {
                    upcomingTripsSection
                }
                
                // Explore Destinations
                exploreDestinationsSection
                
                // Quick Actions
                quickActionsSection
            }
            .padding()
        }
        .navigationTitle("Home")
        .refreshable {
            viewModel.refreshData()
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.clearError()
            }
        } message: {
            if let error = viewModel.errorMessage {
                Text(error)
            }
        }
    }
    
    // MARK: - Welcome Header
    
    private var welcomeHeader: some View {
                VStack(alignment: .leading, spacing: 8) {
            Text("Welcome back,")
                .font(.title3)
                .foregroundColor(.secondary)
            
            Text(authService.currentUser?.displayName ?? "Traveler")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("Ready for your next adventure?")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Quick Stats Card
    
    private var quickStatsCard: some View {
        VStack(spacing: 16) {
            HStack(spacing: 20) {
                StatItem(
                    title: "Total Budget",
                    value: viewModel.totalBudget.formattedCurrency("USD"),
                    icon: "dollarsign.circle.fill",
                    color: .blue
                )
                
                Divider()
                
                StatItem(
                    title: "Expenses",
                    value: viewModel.totalExpenses.formattedCurrency("USD"),
                    icon: "chart.pie.fill",
                    color: .orange
                )
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
        }
    }
    
    // MARK: - Upcoming Trips Section
    
    private var upcomingTripsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Upcoming Trips")
                    .font(.headline)
                
                Spacer()
                
                Button("See All") {
                    navigationCoordinator.navigate(to: .travelPlanList)
                }
                .font(.subheadline)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.upcomingTrips) { trip in
                        TripCard(trip: trip)
                            .onTapGesture {
                                navigationCoordinator.navigate(to: .travelPlanDetail(trip))
                            }
                    }
                }
            }
        }
    }
    
    // MARK: - Explore Destinations Section
    
    private var exploreDestinationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Explore Destinations")
                    .font(.headline)
                
                Spacer()
                
                Button("See All") {
                    // Navigate to destinations
                }
                .font(.subheadline)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.recentDestinations) { destination in
                        DestinationCard(destination: destination)
                            .onTapGesture {
                                navigationCoordinator.navigate(to: .destinationDetail(destination))
                            }
                    }
                }
            }
        }
    }
    
    // MARK: - Quick Actions Section
    
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
                    Text("Quick Actions")
                        .font(.headline)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        QuickActionButton(
                            title: "Plan Trip",
                    icon: "map.fill",
                            color: .blue
                        ) {
                            navigationCoordinator.showCreateTravelPlan()
                        }

                        QuickActionButton(
                    title: "Chat with Maya",
                    icon: "sparkles",
                    color: .purple
                ) {
                    // Navigate to AI assistant
                }
                
                QuickActionButton(
                    title: "Track Budget",
                    icon: "chart.bar.fill",
                            color: .green
                        ) {
                    // Navigate to budget tracker
                        }

                        QuickActionButton(
                            title: "Explore",
                            icon: "globe",
                            color: .orange
                        ) {
                    // Navigate to explore
                }
            }
        }
    }
}

// MARK: - Supporting Views

struct StatItem: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.headline)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity)
    }
}

struct TripCard: View {
    let trip: TravelPlan
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Destination
            HStack {
                Image(systemName: "map.fill")
                    .foregroundColor(.blue)
                Text(trip.destination)
                    .font(.headline)
                    .lineLimit(1)
            }
            
            // Dates
            HStack {
                Image(systemName: "calendar")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(trip.startDate, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Budget
            HStack {
                Image(systemName: "dollarsign.circle")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(trip.budget.formattedCurrency(trip.currency))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Status badge
            HStack {
                Image(systemName: trip.status.icon)
                    .font(.caption2)
                Text(trip.status.displayName)
                    .font(.caption2)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .cornerRadius(8)
        }
        .padding()
        .frame(width: 200)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct DestinationCard: View {
    let destination: Destination
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Placeholder image
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 150, height: 100)
                .cornerRadius(8)
        .overlay {
                    Image(systemName: "photo")
                        .font(.title)
                        .foregroundColor(.gray)
                }
            
            Text(destination.name)
                .font(.headline)
                .lineLimit(1)
            
            Text(destination.country)
                .font(.caption)
                .foregroundColor(.secondary)
            
            if let rating = destination.rating {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.caption2)
                        .foregroundColor(.yellow)
                    Text(String(format: "%.1f", rating))
                        .font(.caption)
                }
            }
        }
        .frame(width: 150)
    }
}

struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)

                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)
        }
    }
}

#Preview {
    NavigationStack {
        HomeView()
            .environmentObject(AuthService.shared)
            .environmentObject(NavigationCoordinator())
    }
}

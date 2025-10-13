import SwiftUI

struct TripPlannerView: View {
    @StateObject private var viewModel = TripPlannerViewModel()
    @State private var showingCreateSheet = false
    
    var body: some View {
        Group {
            if viewModel.trips.isEmpty && !viewModel.isLoading {
                emptyState
            } else {
                tripsList
            }
        }
        .navigationTitle("My Trips")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showingCreateSheet = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showingCreateSheet) {
            CreateTravelPlanView()
        }
        .refreshable {
            await viewModel.loadTrips()
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "map.fill")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Trips Yet")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Start planning your first adventure!")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Button(action: {
                showingCreateSheet = true
            }) {
                Text("Create Trip")
                    .fontWeight(.semibold)
                    .padding()
                    .frame(maxWidth: 200)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding(.top)
        }
    }
    
    private var tripsList: some View {
        List {
            ForEach(viewModel.trips) { trip in
                NavigationLink(value: NavigationRoute.travelPlanDetail(trip)) {
                    TripRow(trip: trip)
                }
            }
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
    }
}

struct TripRow: View {
    let trip: TravelPlan
    
    var body: some View {
        HStack(spacing: 16) {
            // Status icon
            Image(systemName: trip.status.icon)
                .font(.title2)
                .foregroundColor(statusColor)
                .frame(width: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(trip.destination)
                    .font(.headline)
                
                Text("\(trip.startDate, style: .date) - \(trip.endDate, style: .date)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack(spacing: 12) {
                    Label(trip.budget.formattedCurrency(trip.currency), systemImage: "dollarsign.circle")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Label("\(trip.travelers) travelers", systemImage: "person.2")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Progress indicator
            if trip.status == .ongoing {
                ProgressView(value: 0.5)
                    .progressViewStyle(.circular)
                    .frame(width: 30, height: 30)
            }
        }
        .padding(.vertical, 8)
    }
    
    private var statusColor: Color {
        switch trip.status {
        case .draft: return .gray
        case .planned: return .blue
        case .ongoing: return .green
        case .completed: return .purple
        case .cancelled: return .red
        }
    }
}

class TripPlannerViewModel: BaseViewModel {
    @Published var trips: [TravelPlan] = []
    
    private let tripService = TripService.shared
    
    override init() {
        super.init()
        Task {
            await loadTrips()
        }
    }
    
    @MainActor
    func loadTrips() async {
        setLoading(true)
        
        do {
            trips = try await tripService.getTrips()
            setLoading(false)
        } catch {
            handleError(error)
        }
    }
}

#Preview {
    NavigationStack {
        TripPlannerView()
    }
}


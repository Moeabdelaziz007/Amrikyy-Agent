import Foundation
import SwiftUI
import Combine

class NavigationCoordinator: ObservableObject {
    @Published var currentRoute: NavigationRoute = .home
    @Published var navigationPath = NavigationPath()
    @Published var presentedSheet: NavigationRoute?
    @Published var isShowingSheet = false

    private var cancellables = Set<AnyCancellable>()

    init() {
        setupNavigationBindings()
    }

    private func setupNavigationBindings() {
        // Setup any navigation-related bindings here
    }

    func navigate(to route: NavigationRoute) {
        switch route {
        case .home:
            navigationPath.removeLast(navigationPath.count)
        case .travelPlanList:
            navigationPath.append(route)
        case .travelPlanDetail(let plan):
            navigationPath.append(route)
        case .destinationDetail(let destination):
            navigationPath.append(route)
        case .profile:
            navigationPath.append(route)
        case .settings:
            navigationPath.append(route)
        }
    }

    func navigateBack() {
        if !navigationPath.isEmpty {
            navigationPath.removeLast()
        }
    }

    func popToRoot() {
        navigationPath.removeLast(navigationPath.count)
    }

    func presentSheet(_ route: NavigationRoute) {
        presentedSheet = route
        isShowingSheet = true
    }

    func dismissSheet() {
        presentedSheet = nil
        isShowingSheet = false
    }

    func goToTravelPlan(_ plan: TravelPlan) {
        navigate(to: .travelPlanDetail(plan))
    }

    func goToDestination(_ destination: Destination) {
        navigate(to: .destinationDetail(destination))
    }

    func showCreateTravelPlan() {
        presentSheet(.createTravelPlan)
    }

    func showSettings() {
        presentSheet(.settings)
    }
}

enum NavigationRoute: Hashable {
    case home
    case travelPlanList
    case travelPlanDetail(TravelPlan)
    case destinationDetail(Destination)
    case profile
    case settings
    case createTravelPlan

    func hash(into hasher: inout Hasher) {
        switch self {
        case .home:
            hasher.combine("home")
        case .travelPlanList:
            hasher.combine("travelPlanList")
        case .travelPlanDetail(let plan):
            hasher.combine("travelPlanDetail")
            hasher.combine(plan.id)
        case .destinationDetail(let destination):
            hasher.combine("destinationDetail")
            hasher.combine(destination.id)
        case .profile:
            hasher.combine("profile")
        case .settings:
            hasher.combine("settings")
        case .createTravelPlan:
            hasher.combine("createTravelPlan")
        }
    }

    static func == (lhs: NavigationRoute, rhs: NavigationRoute) -> Bool {
        return lhs.hashValue == rhs.hashValue
    }
}

// Navigation Router View
struct NavigationRouter: View {
    @StateObject private var coordinator = NavigationCoordinator()

    var body: some View {
        NavigationStack(path: $coordinator.navigationPath) {
            ContentView()
                .navigationDestination(for: NavigationRoute.self) { route in
                    switch route {
                    case .home:
                        HomeView()
                    case .travelPlanList:
                        TravelPlanListView()
                    case .travelPlanDetail(let plan):
                        TravelPlanView(travelPlan: plan)
                    case .destinationDetail(let destination):
                        DestinationDetailView(destination: destination)
                    case .profile:
                        ProfileView()
                    case .settings:
                        SettingsView()
                    case .createTravelPlan:
                        CreateTravelPlanView()
                    }
                }
                .sheet(isPresented: $coordinator.isShowingSheet) {
                    if let route = coordinator.presentedSheet {
                        switch route {
                        case .settings:
                            SettingsView()
                        case .createTravelPlan:
                            CreateTravelPlanView()
                        default:
                            EmptyView()
                        }
                    }
                }
        }
        .environmentObject(coordinator)
    }
}

// Placeholder views for the navigation destinations
struct TravelPlanListView: View {
    var body: some View {
        Text("Travel Plans List")
            .navigationTitle("My Trips")
    }
}

struct DestinationDetailView: View {
    let destination: Destination

    var body: some View {
        Text("Destination: \(destination.name)")
            .navigationTitle(destination.name)
    }
}

struct ProfileView: View {
    var body: some View {
        Text("User Profile")
            .navigationTitle("Profile")
    }
}

struct SettingsView: View {
    var body: some View {
        Text("Settings")
            .navigationTitle("Settings")
    }
}

struct CreateTravelPlanView: View {
    var body: some View {
        Text("Create Travel Plan")
            .navigationTitle("New Trip")
    }
}
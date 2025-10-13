import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authService: AuthService
    @EnvironmentObject var navigationCoordinator: NavigationCoordinator
    
    var body: some View {
        Group {
            if authService.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .animation(.easeInOut, value: authService.isAuthenticated)
    }
}

struct MainTabView: View {
    @EnvironmentObject var navigationCoordinator: NavigationCoordinator
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack(path: $navigationCoordinator.navigationPath) {
                HomeView()
                    .navigationDestination(for: NavigationRoute.self) { route in
                        navigationDestination(for: route)
                    }
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }
            .tag(0)
            
            NavigationStack {
                TripPlannerView()
            }
            .tabItem {
                Label("Plan", systemImage: "map.fill")
            }
            .tag(1)
            
            NavigationStack {
                DestinationsView()
            }
            .tabItem {
                Label("Explore", systemImage: "globe")
            }
            .tag(2)
            
            NavigationStack {
                AIAssistantView()
            }
            .tabItem {
                Label("Maya AI", systemImage: "sparkles")
            }
            .tag(3)
            
            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
            .tag(4)
        }
        .environmentObject(navigationCoordinator)
    }
    
    @ViewBuilder
    private func navigationDestination(for route: NavigationRoute) -> some View {
        switch route {
        case .home:
            HomeView()
        case .travelPlanList:
            TravelPlanListView()
        case .travelPlanDetail(let plan):
            TravelPlanDetailView(travelPlan: plan)
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
}

struct LoginView: View {
    @EnvironmentObject var authService: AuthService
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Logo
                Image(systemName: "airplane.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                    .foregroundColor(.blue)
                    .padding(.bottom, 30)
                
                Text("Maya Travel Agent")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Your AI-powered travel companion")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.bottom, 40)
                
                // Email field
                TextField("Email", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .keyboardType(.emailAddress)
                
                // Password field
                SecureField("Password", text: $password)
                    .textFieldStyle(.roundedBorder)
                    .textContentType(.password)
                
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                }
                
                // Login button
                Button(action: login) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Login")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(isLoading || email.isEmpty || password.isEmpty)
                
                // Guest login button
                Button(action: guestLogin) {
                    Text("Continue as Guest")
                        .fontWeight(.medium)
                }
                .foregroundColor(.blue)
                .padding(.top, 10)
            }
            .padding()
            .navigationBarHidden(true)
        }
    }
    
    private func login() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await authService.login(email: email, password: password)
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
    
    private func guestLogin() {
        authService.loginAsGuest()
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthService.shared)
        .environmentObject(NavigationCoordinator())
}

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authService: AuthService
    @EnvironmentObject var navigationCoordinator: NavigationCoordinator

    var body: some View {
        Group {
            if authService.isAuthenticated {
                MainTabView()
            } else {
                AmrikyyLoginView()
            }
        }
        .animation(.easeInOut, value: authService.isAuthenticated)
        .preferredColorScheme(.dark) // Force dark mode
    }
}

struct MainTabView: View {
    @EnvironmentObject var navigationCoordinator: NavigationCoordinator
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack(path: $navigationCoordinator.navigationPath) {
                AmrikyyHomeView()
                    .navigationDestination(for: NavigationRoute.self) { route in
                        navigationDestination(for: route)
                    }
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }
            .tag(0)
            
            NavigationStack {
                AgentGalleryView()
            }
            .tabItem {
                Label("Agents", systemImage: "person.3.fill")
            }
            .tag(1)
            
            NavigationStack {
                TripPlannerView()
            }
            .tabItem {
                Label("Plan", systemImage: "map.fill")
            }
            .tag(2)
            
            NavigationStack {
                AmrikyyAIView()
            }
            .tabItem {
                Label("Amrikyy AI", systemImage: "sparkles")
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
        .accentColor(Color("AmrikyyBlue")) // Use custom blue
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

// MARK: - Amrikyy Login View (Dark Glassmorphism)
struct AmrikyyLoginView: View {
    @EnvironmentObject var authService: AuthService
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var isBreathing = false
    
    var body: some View {
        ZStack {
            // Dark gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.06, green: 0.09, blue: 0.16), // #0F172A
                    Color(red: 0.12, green: 0.16, blue: 0.23), // #1E293B
                    Color(red: 0.06, green: 0.09, blue: 0.16)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Particle effects
            ForEach(0..<20, id: \.self) { i in
                Circle()
                    .fill(Color.blue.opacity(0.3))
                    .frame(width: 4, height: 4)
                    .offset(
                        x: CGFloat.random(in: -200...200),
                        y: CGFloat.random(in: -400...400)
                    )
                    .animation(
                        Animation.linear(duration: Double.random(in: 3...8))
                            .repeatForever(autoreverses: false)
                            .delay(Double.random(in: 0...3)),
                        value: isBreathing
                    )
            }
            
            ScrollView {
                VStack(spacing: 30) {
                    Spacer().frame(height: 60)
                    
                    // Hexagonal Avatar with breathing animation
                    ZStack {
                        // Glow ring
                        HexagonShape()
                            .stroke(Color.blue.opacity(0.5), lineWidth: 2)
                            .frame(width: 140, height: 140)
                            .scaleEffect(isBreathing ? 1.1 : 1.0)
                            .opacity(isBreathing ? 0.3 : 0.6)
                            .animation(
                                Animation.easeInOut(duration: 3)
                                    .repeatForever(autoreverses: true),
                                value: isBreathing
                            )
                        
                        // Main hexagon
                        HexagonShape()
                            .fill(
                                LinearGradient(
                                    colors: [Color.blue, Color.purple],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 120, height: 120)
                            .overlay(
                                Text("🌟")
                                    .font(.system(size: 60))
                            )
                            .scaleEffect(isBreathing ? 1.05 : 1.0)
                            .animation(
                                Animation.easeInOut(duration: 4)
                                    .repeatForever(autoreverses: true),
                                value: isBreathing
                            )
                        
                        // Status indicator
                        Circle()
                            .fill(Color.green)
                            .frame(width: 20, height: 20)
                            .overlay(
                                Circle()
                                    .stroke(Color(red: 0.06, green: 0.09, blue: 0.16), lineWidth: 4)
                            )
                            .offset(x: 50, y: -50)
                    }
                    .onAppear {
                        isBreathing = true
                    }
                    
                    // Title
                    VStack(spacing: 8) {
                        Text("Meet Amrikyy")
                            .font(.system(size: 42, weight: .bold))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [Color.blue, Color.purple, Color.pink],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                        
                        Text("Your AI Travel Companion with a Soul")
                            .font(.title3)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                        
                        Text("Plan trips • Save money • Respect cultures")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                    
                    // Login Form - Glassmorphism
                    VStack(spacing: 16) {
                        // Email field
                        GlassTextField(
                            placeholder: "Email",
                            text: $email,
                            keyboardType: .emailAddress
                        )
                        
                        // Password field
                        GlassSecureField(
                            placeholder: "Password",
                            text: $password
                        )
                        
                        if let errorMessage = errorMessage {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .font(.caption)
                                .padding(.horizontal)
                        }
                        
                        // Login button
                        Button(action: login) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Text("Start Your Journey")
                                        .fontWeight(.semibold)
                                    Image(systemName: "arrow.right")
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [Color.blue, Color.purple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .foregroundColor(.white)
                            .cornerRadius(16)
                            .shadow(color: Color.blue.opacity(0.3), radius: 20)
                        }
                        .disabled(isLoading || email.isEmpty || password.isEmpty)
                        
                        // Guest login
                        Button(action: guestLogin) {
                            Text("Continue as Guest")
                                .fontWeight(.medium)
                                .foregroundColor(.blue)
                        }
                        .padding(.top, 8)
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 32)
                    .background(
                        GlassBackground()
                    )
                    .cornerRadius(24)
                    .padding(.horizontal)
                    
                    // Trust indicators
                    HStack(spacing: 24) {
                        TrustBadge(icon: "person.3.fill", text: "100+ travelers")
                        TrustBadge(icon: "chart.line.uptrend.xyaxis", text: "1K+ trips")
                        TrustBadge(icon: "star.fill", text: "4.9/5")
                    }
                    .padding(.horizontal)
                    
                    Spacer()
                }
            }
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

// MARK: - Glass Components
struct GlassBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color.white.opacity(0.1),
                    Color.white.opacity(0.05)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
        }
        .background(.ultraThinMaterial)
    }
}

struct GlassTextField: View {
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        TextField(placeholder, text: $text)
            .textFieldStyle(.plain)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
            )
            .foregroundColor(.white)
            .keyboardType(keyboardType)
            .autocapitalization(.none)
    }
}

struct GlassSecureField: View {
    let placeholder: String
    @Binding var text: String
    
    var body: some View {
        SecureField(placeholder, text: $text)
            .textFieldStyle(.plain)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
            )
            .foregroundColor(.white)
    }
}

struct TrustBadge: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .font(.caption)
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Hexagon Shape
struct HexagonShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        
        path.move(to: CGPoint(x: width * 0.5, y: 0))
        path.addLine(to: CGPoint(x: width, y: height * 0.25))
        path.addLine(to: CGPoint(x: width, y: height * 0.75))
        path.addLine(to: CGPoint(x: width * 0.5, y: height))
        path.addLine(to: CGPoint(x: 0, y: height * 0.75))
        path.addLine(to: CGPoint(x: 0, y: height * 0.25))
        path.closeSubpath()
        
        return path
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthService.shared)
        .environmentObject(NavigationCoordinator())
}

import SwiftUI
import Firebase
import FirebaseAnalytics
import FirebaseCrashlytics
import FirebaseMessaging

@main
struct AmrikyyTravelAgentApp: App {
    @StateObject private var authService = AuthService.shared
    @StateObject private var navigationCoordinator = NavigationCoordinator()
    @StateObject private var notificationService = NotificationService.shared
    @StateObject private var analyticsService = AnalyticsService.shared
    @StateObject private var offlineStorageService = OfflineStorageService.shared
    
    init() {
        // Initialize Firebase
        FirebaseApp.configure()
        
        // Configure Firebase services
        setupFirebaseServices()
        
        // Configure app appearance
        setupAppearance()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .environmentObject(navigationCoordinator)
                .environmentObject(notificationService)
                .environmentObject(analyticsService)
                .environmentObject(offlineStorageService)
                .onAppear {
                    // Check for existing auth token
                    authService.checkAuthStatus()
                    
                    // Request notification permissions
                    notificationService.requestNotificationPermission()
                    
                    // Track app launch
                    analyticsService.trackAppLifecycle(.appLaunch)
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)) { _ in
                    analyticsService.trackAppLifecycle(.appBackground)
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
                    analyticsService.trackAppLifecycle(.appForeground)
                }
        }
    }
    
    private func setupFirebaseServices() {
        // Configure Analytics
        Analytics.setAnalyticsCollectionEnabled(true)
        
        // Configure Crashlytics
        Crashlytics.crashlytics().setCrashlyticsCollectionEnabled(true)
        
        // Configure Messaging
        Messaging.messaging().delegate = notificationService
    }
    
    private func setupAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBackground
        appearance.titleTextAttributes = [.foregroundColor: UIColor.label]
        appearance.largeTitleTextAttributes = [.foregroundColor: UIColor.label]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
        
        // Configure tab bar appearance
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor.systemBackground
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
    }
}

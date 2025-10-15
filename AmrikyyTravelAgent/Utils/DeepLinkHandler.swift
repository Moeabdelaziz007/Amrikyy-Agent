import Foundation
import SwiftUI

/// Deep Link Handler
/// Handles all deep links from Telegram, web, and other sources
class DeepLinkHandler: ObservableObject {
    @Published var authToken: String?
    @Published var shouldNavigateTo: String?
    @Published var tripId: String?
    @Published var destinationId: String?
    
    private let authService = AuthService.shared
    private let telegramService = TelegramIntegrationService.shared
    
    // MARK: - Main Handler
    
    func handle(url: URL) {
        print("🔗 Handling deep link: \(url.absoluteString)")
        
        guard url.scheme == "mayatravel" else {
            print("⚠️ Unknown URL scheme: \(url.scheme ?? "none")")
            return
        }
        
        switch url.host {
        case "auth":
            handleAuthLink(url)
        case "trip":
            handleTripLink(url)
        case "destination":
            handleDestinationLink(url)
        case "chat":
            handleChatLink(url)
        default:
            print("⚠️ Unknown deep link host: \(url.host ?? "none")")
        }
    }
    
    // MARK: - Specific Handlers
    
    /// Handle authentication deep link
    /// Format: mayatravel://auth?token=xxx
    private func handleAuthLink(_ url: URL) {
        let components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        
        if let token = components?.queryItems?.first(where: { $0.name == "token" })?.value {
            authToken = token
            
            Task {
                do {
                    try await authService.loginWithToken(token)
                    
                    await MainActor.run {
                        shouldNavigateTo = "home"
                    }
                    
                    print("✅ Authenticated via deep link")
                } catch {
                    print("❌ Auth deep link failed: \(error)")
                    await MainActor.run {
                        authToken = nil
                    }
                }
            }
        }
    }
    
    /// Handle trip deep link
    /// Format: mayatravel://trip?id=xxx
    private func handleTripLink(_ url: URL) {
        let components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        
        if let id = components?.queryItems?.first(where: { $0.name == "id" })?.value {
            tripId = id
            shouldNavigateTo = "trip"
            print("📍 Navigating to trip: \(id)")
        }
    }
    
    /// Handle destination deep link
    /// Format: mayatravel://destination?id=xxx
    private func handleDestinationLink(_ url: URL) {
        let components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        
        if let id = components?.queryItems?.first(where: { $0.name == "id" })?.value {
            destinationId = id
            shouldNavigateTo = "destination"
            print("🗺️ Navigating to destination: \(id)")
        }
    }
    
    /// Handle chat deep link
    /// Format: mayatravel://chat?message=xxx
    private func handleChatLink(_ url: URL) {
        shouldNavigateTo = "chat"
        print("💬 Opening chat")
    }
    
    // MARK: - Helper Methods
    
    /// Reset navigation state
    func resetNavigation() {
        shouldNavigateTo = nil
        tripId = nil
        destinationId = nil
    }
    
    /// Generate deep link for sharing
    static func generateDeepLink(type: String, id: String? = nil) -> String {
        var link = "mayatravel://\(type)"
        if let id = id {
            link += "?id=\(id)"
        }
        return link
    }
    
    /// Generate web link (fallback for platforms without app)
    static func generateWebLink(type: String, id: String? = nil) -> String {
        var link = "https://maya-travel-agent.vercel.app/\(type)"
        if let id = id {
            link += "?id=\(id)"
        }
        return link
    }
}


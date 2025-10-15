import Foundation
import SwiftUI
import Combine

/// Telegram Integration Service
/// Manages Telegram account linking and cross-platform functionality
class TelegramIntegrationService: ObservableObject {
    static let shared = TelegramIntegrationService()
    
    @Published var isLinked = false
    @Published var telegramUser: TelegramUser?
    @Published var isLoading = false
    
    private let api = APIService.shared
    private let authService = AuthService.shared
    private var cancellables = Set<AnyCancellable>()
    
    struct TelegramUser: Codable {
        let id: String
        let firstName: String
        let lastName: String?
        let username: String?
        let photoURL: String?
        
        enum CodingKeys: String, CodingKey {
            case id
            case firstName = "first_name"
            case lastName = "last_name"
            case username
            case photoURL = "photo_url"
        }
    }
    
    struct TelegramLinkStatus: Codable {
        let isLinked: Bool
        let telegramUser: TelegramUser?
        
        enum CodingKeys: String, CodingKey {
            case isLinked = "is_linked"
            case telegramUser = "telegram_user"
        }
    }
    
    private init() {}
    
    // MARK: - Public Methods
    
    /// Check if Telegram account is linked
    func checkLinkStatus() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let response: APIResponse<TelegramLinkStatus> = try await api.request(
                endpoint: "profile/telegram-link-status",
                method: .get
            )
            
            await MainActor.run {
                if let status = response.data {
                    self.isLinked = status.isLinked
                    self.telegramUser = status.telegramUser
                }
            }
        } catch {
            print("❌ Failed to check Telegram link status: \(error)")
        }
    }
    
    /// Generate Telegram bot link URL for account linking
    func generateLinkURL() -> String {
        guard let token = authService.getStoredToken() else {
            return "https://t.me/maya_travel_bot"
        }
        
        // Telegram deep link with link token
        return "https://t.me/maya_travel_bot?start=link_\(token)"
    }
    
    /// Open Telegram app to link account
    func openTelegramToLink() {
        let urlString = generateLinkURL()
        guard let url = URL(string: urlString) else { return }
        
        UIApplication.shared.open(url) { success in
            if success {
                print("✅ Opened Telegram app for linking")
            } else {
                print("❌ Failed to open Telegram app")
            }
        }
    }
    
    /// Unlink Telegram account
    func unlinkTelegram() async throws {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let response: APIResponse<Bool> = try await api.request(
                endpoint: "profile/unlink-telegram",
                method: .post
            )
            
            if response.success {
                await MainActor.run {
                    self.isLinked = false
                    self.telegramUser = nil
                }
            }
        } catch {
            print("❌ Failed to unlink Telegram: \(error)")
            throw error
        }
    }
    
    /// Handle deep link from Telegram
    func handleDeepLink(url: URL) {
        guard url.scheme == "mayatravel", url.host == "auth" else { return }
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        
        if let token = components?.queryItems?.first(where: { $0.name == "token" })?.value {
            Task {
                do {
                    try await authService.loginWithToken(token)
                    print("✅ Authenticated from Telegram deep link")
                } catch {
                    print("❌ Failed to authenticate from Telegram: \(error)")
                }
            }
        }
    }
    
    /// Verify link was successful (call after returning from Telegram)
    func verifyLinkCompletion() async {
        // Wait a bit for backend to process
        try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
        
        // Recheck status
        await checkLinkStatus()
    }
}


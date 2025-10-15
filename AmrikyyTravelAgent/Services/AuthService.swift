import Foundation
import Combine

/// Authentication service managing user auth state
class AuthService: ObservableObject {
    static let shared = AuthService()
    
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    
    private let api = APIService.shared
    private let tokenKey = "maya_auth_token"
    
    private init() {}
    
    // MARK: - Authentication Methods
    
    func checkAuthStatus() {
        if let token = getStoredToken() {
            api.setAuthToken(token)
            // TODO: Validate token with backend
            // For now, just check if token exists
            isAuthenticated = true
            loadUserProfile()
        }
    }
    
    func login(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        let parameters: [String: Any] = [
            "email": email,
            "password": password
        ]
        
        do {
            let response: AuthResponse = try await api.request(
                endpoint: "miniapp/auth/telegram",
                method: .post,
                parameters: parameters
            )
            
            if let token = response.token {
                saveToken(token)
                api.setAuthToken(token)
                
                if let user = response.profile {
                    await MainActor.run {
                        self.currentUser = user
                        self.isAuthenticated = true
                    }
                }
            } else if let error = response.error {
                throw APIError.serverError(error)
            }
        } catch {
            throw error
        }
    }
    
    func loginAsGuest() {
        DispatchQueue.main.async {
            self.currentUser = User.guest
            self.isAuthenticated = true
        }
    }
    
    func logout() {
        clearToken()
        api.setAuthToken(nil)
        
        DispatchQueue.main.async {
            self.currentUser = nil
            self.isAuthenticated = false
        }
    }
    
    func loadUserProfile() {
        Task {
            // TODO: Implement profile loading from backend
            // For now, create a mock user
            await MainActor.run {
                self.currentUser = User(
                    id: "1",
                    email: "user@example.com",
                    username: "user",
                    preferences: UserPreferences()
                )
            }
        }
    }
    
    // MARK: - Token Management
    
    private func saveToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: tokenKey)
    }
    
    private func getStoredToken() -> String? {
        UserDefaults.standard.string(forKey: tokenKey)
    }
    
    private func clearToken() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
    }
}


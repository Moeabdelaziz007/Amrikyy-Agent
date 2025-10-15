import Foundation
import Combine

/// Base ViewModel with common functionality
class BaseViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    
    var cancellables = Set<AnyCancellable>()
    
    func handleError(_ error: Error) {
        DispatchQueue.main.async {
            self.isLoading = false
            self.errorMessage = error.localizedDescription
        }
    }
    
    func clearError() {
        errorMessage = nil
    }
    
    func showSuccess(_ message: String) {
        DispatchQueue.main.async {
            self.successMessage = message
        }
        
        // Auto-clear success message after 3 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            self.successMessage = nil
        }
    }
    
    func setLoading(_ loading: Bool) {
        DispatchQueue.main.async {
            self.isLoading = loading
        }
    }
}

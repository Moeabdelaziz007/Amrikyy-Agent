import Foundation

/// Payment service for handling payments
class PaymentService {
    static let shared = PaymentService()
    
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - Payment Methods
    
    func createPaymentLink(
        amount: Double,
        currency: String = "USD",
        description: String
    ) async throws -> PaymentLink {
        let parameters: [String: Any] = [
            "amount": amount,
            "currency": currency,
            "description": description
        ]
        
        let response: PaymentResponse = try await api.request(
            endpoint: "payment/create-payment-link",
            method: .post,
            parameters: parameters
        )
        
        if response.success, let paymentLink = response.paymentLink {
            return paymentLink
        } else if let error = response.error {
            throw APIError.serverError(error)
        } else {
            throw APIError.serverError("Failed to create payment link")
        }
    }
    
    func createPayment(
        amount: Double,
        currency: String = "USD",
        paymentMethod: String,
        description: String,
        chatId: String? = nil
    ) async throws -> Payment {
        var parameters: [String: Any] = [
            "amount": amount,
            "currency": currency,
            "paymentMethod": paymentMethod,
            "description": description
        ]
        
        if let chatId = chatId {
            parameters["chatId"] = chatId
        }
        
        let response: PaymentResponse = try await api.request(
            endpoint: "payment/create-payment",
            method: .post,
            parameters: parameters
        )
        
        if response.success, let payment = response.payment {
            return payment
        } else if let error = response.error {
            throw APIError.serverError(error)
        } else {
            throw APIError.serverError("Failed to create payment")
        }
    }
    
    func confirmPayment(paymentId: String, paymentMethod: String) async throws -> Bool {
        let parameters: [String: Any] = [
            "paymentId": paymentId,
            "paymentMethod": paymentMethod
        ]
        
        struct ConfirmResponse: Codable {
            let success: Bool
            let message: String?
            let error: String?
        }
        
        let response: ConfirmResponse = try await api.request(
            endpoint: "payment/confirm-payment",
            method: .post,
            parameters: parameters
        )
        
        if response.success {
            return true
        } else if let error = response.error {
            throw APIError.serverError(error)
        } else {
            return false
        }
    }
    
    func getPaymentStatus(paymentId: String) async throws -> Payment {
        struct StatusResponse: Codable {
            let success: Bool
            let payment: Payment?
            let error: String?
        }
        
        let response: StatusResponse = try await api.request(
            endpoint: "payment/payment-status/\(paymentId)",
            method: .get
        )
        
        if response.success, let payment = response.payment {
            return payment
        } else if let error = response.error {
            throw APIError.serverError(error)
        } else {
            throw APIError.serverError("Failed to get payment status")
        }
    }
}


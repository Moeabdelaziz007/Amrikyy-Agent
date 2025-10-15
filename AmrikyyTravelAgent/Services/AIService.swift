import Foundation

/// AI service for Maya AI assistant integration
class AIService {
    static let shared = AIService()
    
    private let api = APIService.shared
    
    private init() {}
    
    // MARK: - AI Chat
    
    func chat(
        message: String,
        conversationHistory: [Message] = [],
        useTools: Bool = false,
        region: String = "en"
    ) async throws -> AIChatResponse {
        let historyDicts = conversationHistory.map { msg in
            ["role": msg.role.rawValue, "content": msg.content]
        }
        
        let parameters: [String: Any] = [
            "message": message,
            "conversationHistory": historyDicts,
            "useTools": useTools,
            "region": region
        ]
        
        return try await api.request(
            endpoint: "ai/chat",
            method: .post,
            parameters: parameters
        )
    }
    
    // MARK: - Travel Recommendations
    
    func getTravelRecommendations(
        destination: String,
        budget: Double,
        duration: Int,
        preferences: [String] = []
    ) async throws -> TravelRecommendationsResponse {
        let parameters: [String: Any] = [
            "destination": destination,
            "budget": budget,
            "duration": duration,
            "preferences": preferences
        ]
        
        return try await api.request(
            endpoint: "ai/travel-recommendations",
            method: .post,
            parameters: parameters
        )
    }
    
    // MARK: - Budget Analysis
    
    func getBudgetAnalysis(
        tripData: TravelPlan,
        totalBudget: Double
    ) async throws -> BudgetAnalysisResponse {
        let tripDict: [String: Any] = [
            "destination": tripData.destination,
            "startDate": ISO8601DateFormatter().string(from: tripData.startDate),
            "endDate": ISO8601DateFormatter().string(from: tripData.endDate),
            "travelers": tripData.travelers
        ]
        
        let parameters: [String: Any] = [
            "tripData": tripDict,
            "totalBudget": totalBudget
        ]
        
        return try await api.request(
            endpoint: "ai/budget-analysis",
            method: .post,
            parameters: parameters
        )
    }
    
    // MARK: - Destination Insights
    
    func getDestinationInsights(
        destination: String,
        travelType: String = "leisure"
    ) async throws -> DestinationInsightsResponse {
        let parameters: [String: Any] = [
            "destination": destination,
            "travelType": travelType
        ]
        
        return try await api.request(
            endpoint: "ai/destination-insights",
            method: .post,
            parameters: parameters
        )
    }
    
    // MARK: - Payment Recommendations
    
    func getPaymentRecommendations(
        tripDetails: TravelPlan,
        paymentMethod: String = "credit_card"
    ) async throws -> String {
        let tripDict: [String: Any] = [
            "destination": tripDetails.destination,
            "budget": tripDetails.budget,
            "duration": tripDetails.duration
        ]
        
        let parameters: [String: Any] = [
            "tripDetails": tripDict,
            "paymentMethod": paymentMethod
        ]
        
        struct Response: Codable {
            let success: Bool
            let recommendations: String?
            let error: String?
        }
        
        let response: Response = try await api.request(
            endpoint: "ai/payment-recommendations",
            method: .post,
            parameters: parameters
        )
        
        if response.success, let recommendations = response.recommendations {
            return recommendations
        } else if let error = response.error {
            throw APIError.serverError(error)
        } else {
            throw APIError.serverError("Failed to get payment recommendations")
        }
    }
    
    // MARK: - Multimodal Analysis
    
    func analyzeMedia(
        prompt: String,
        imageUrls: [String] = [],
        videoUrl: String? = nil
    ) async throws -> String {
        var parameters: [String: Any] = [
            "prompt": prompt
        ]
        
        if !imageUrls.isEmpty {
            parameters["imageUrls"] = imageUrls
        }
        
        if let videoUrl = videoUrl {
            parameters["videoUrl"] = videoUrl
        }
        
        struct Response: Codable {
            let success: Bool
            let analysis: String?
            let error: String?
        }
        
        let response: Response = try await api.request(
            endpoint: "ai/multimodal/analyze",
            method: .post,
            parameters: parameters
        )
        
        if response.success, let analysis = response.analysis {
            return analysis
        } else if let error = response.error {
            throw APIError.serverError(error)
        } else {
            throw APIError.serverError("Failed to analyze media")
        }
    }
    
    // MARK: - Health Check
    
    func healthCheck() async throws -> HealthResponse {
        return try await api.request(
            endpoint: "ai/health",
            method: .get
        )
    }
}


import Foundation

/// Comprehensive analytics data model for Maya Travel Agent
struct AnalyticsData: Codable, Identifiable, Hashable {
    let id: String
    var userId: String?
    var sessionId: String?
    var timestamp: Date
    var dateRange: DateRange
    
    // User Analytics
    var userMetrics: UserMetrics?
    var engagementMetrics: EngagementMetrics?
    var preferenceMetrics: PreferenceMetrics?
    
    // Trip Analytics
    var tripMetrics: TripMetrics?
    var destinationMetrics: DestinationMetrics?
    var bookingMetrics: BookingMetrics?
    
    // AI Analytics
    var aiInteractionMetrics: AIInteractionMetrics?
    var responseQualityMetrics: ResponseQualityMetrics?
    var conversationMetrics: ConversationMetrics?
    
    // Performance Analytics
    var appPerformanceMetrics: AppPerformanceMetrics?
    var featureUsageMetrics: FeatureUsageMetrics?
    var errorMetrics: ErrorMetrics?
    
    // Business Analytics
    var revenueMetrics: RevenueMetrics?
    var conversionMetrics: ConversionMetrics?
    var retentionMetrics: RetentionMetrics?
    
    var summary: AnalyticsSummary?
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case sessionId = "session_id"
        case timestamp
        case dateRange = "date_range"
        case userMetrics = "user_metrics"
        case engagementMetrics = "engagement_metrics"
        case preferenceMetrics = "preference_metrics"
        case tripMetrics = "trip_metrics"
        case destinationMetrics = "destination_metrics"
        case bookingMetrics = "booking_metrics"
        case aiInteractionMetrics = "ai_interaction_metrics"
        case responseQualityMetrics = "response_quality_metrics"
        case conversationMetrics = "conversation_metrics"
        case appPerformanceMetrics = "app_performance_metrics"
        case featureUsageMetrics = "feature_usage_metrics"
        case errorMetrics = "error_metrics"
        case revenueMetrics = "revenue_metrics"
        case conversionMetrics = "conversion_metrics"
        case retentionMetrics = "retention_metrics"
        case summary
    }
    
    init(
        id: String = UUID().uuidString,
        userId: String? = nil,
        sessionId: String? = nil,
        timestamp: Date = Date(),
        dateRange: DateRange,
        userMetrics: UserMetrics? = nil,
        engagementMetrics: EngagementMetrics? = nil,
        preferenceMetrics: PreferenceMetrics? = nil,
        tripMetrics: TripMetrics? = nil,
        destinationMetrics: DestinationMetrics? = nil,
        bookingMetrics: BookingMetrics? = nil,
        aiInteractionMetrics: AIInteractionMetrics? = nil,
        responseQualityMetrics: ResponseQualityMetrics? = nil,
        conversationMetrics: ConversationMetrics? = nil,
        appPerformanceMetrics: AppPerformanceMetrics? = nil,
        featureUsageMetrics: FeatureUsageMetrics? = nil,
        errorMetrics: ErrorMetrics? = nil,
        revenueMetrics: RevenueMetrics? = nil,
        conversionMetrics: ConversionMetrics? = nil,
        retentionMetrics: RetentionMetrics? = nil,
        summary: AnalyticsSummary? = nil
    ) {
        self.id = id
        self.userId = userId
        self.sessionId = sessionId
        self.timestamp = timestamp
        self.dateRange = dateRange
        self.userMetrics = userMetrics
        self.engagementMetrics = engagementMetrics
        self.preferenceMetrics = preferenceMetrics
        self.tripMetrics = tripMetrics
        self.destinationMetrics = destinationMetrics
        self.bookingMetrics = bookingMetrics
        self.aiInteractionMetrics = aiInteractionMetrics
        self.responseQualityMetrics = responseQualityMetrics
        self.conversationMetrics = conversationMetrics
        self.appPerformanceMetrics = appPerformanceMetrics
        self.featureUsageMetrics = featureUsageMetrics
        self.errorMetrics = errorMetrics
        self.revenueMetrics = revenueMetrics
        self.conversionMetrics = conversionMetrics
        self.retentionMetrics = retentionMetrics
        self.summary = summary
    }
}

// MARK: - Supporting Models

/// Date range for analytics period
struct DateRange: Codable, Hashable {
    var start: Date
    var end: Date
    
    var duration: TimeInterval {
        end.timeIntervalSince(start)
    }
    
    var days: Int {
        Calendar.current.dateComponents([.day], from: start, to: end).day ?? 0
    }
}

/// Analytics summary with key insights
struct AnalyticsSummary: Codable, Hashable {
    var totalUsers: Int
    var totalTrips: Int
    var totalRevenue: Double
    var averageTripValue: Double
    var topDestinations: [String]
    var userSatisfactionScore: Double
    var aiAccuracyScore: Double
    var keyInsights: [String]
    var recommendations: [String]
}

// MARK: - User Analytics

struct UserMetrics: Codable, Hashable {
    var totalUsers: Int
    var newUsers: Int
    var activeUsers: Int
    var returningUsers: Int
    var userGrowthRate: Double
    var churnRate: Double
    var averageSessionDuration: TimeInterval
    var usersByDevice: [String: Int]
    var usersByRegion: [String: Int]
}

struct EngagementMetrics: Codable, Hashable {
    var dailyActiveUsers: Int
    var weeklyActiveUsers: Int
    var monthlyActiveUsers: Int
    var averageSessionsPerUser: Double
    var averagePageViewsPerSession: Double
    var bounceRate: Double
    var timeSpentInApp: TimeInterval
    var featureEngagement: [String: Double]
}

struct PreferenceMetrics: Codable, Hashable {
    var popularTravelStyles: [String: Int]
    var popularDestinations: [String: Int]
    var popularActivities: [String: Int]
    var averageBudgetRange: ClosedRange<Double>
    var preferredCurrencies: [String: Int]
    var languagePreferences: [String: Int]
    var dietaryRestrictions: [String: Int]
}

// MARK: - Trip Analytics

struct TripMetrics: Codable, Hashable {
    var totalTrips: Int
    var plannedTrips: Int
    var completedTrips: Int
    var cancelledTrips: Int
    var averageTripDuration: Int // days
    var averageTripBudget: Double
    var tripsByStatus: [String: Int]
    var tripsBySeason: [String: Int]
    var popularTripTypes: [String: Int]
}

struct DestinationMetrics: Codable, Hashable {
    var topDestinations: [DestinationStat]
    var trendingDestinations: [DestinationStat]
    var seasonalPopularity: [String: [String: Int]]
    var averageRating: Double
    var priceRanges: [String: Int]
    var destinationCategories: [String: Int]
}

struct DestinationStat: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var country: String
    var bookingCount: Int
    var averageRating: Double
    var averagePrice: Double
    var popularityScore: Int
}

struct BookingMetrics: Codable, Hashable {
    var totalBookings: Int
    var bookingValue: Double
    var averageBookingValue: Double
    var bookingConversionRate: Double
    var bookingsByCategory: [String: Int]
    var bookingTrends: [Date: Int]
    var cancellationRate: Double
    var refundRate: Double
}

// MARK: - AI Analytics

struct AIInteractionMetrics: Codable, Hashable {
    var totalInteractions: Int
    var totalConversations: Int
    var averageMessagesPerConversation: Double
    var aiResponseTime: TimeInterval
    var userSatisfactionScore: Double
    var interactionTypes: [String: Int]
    var popularTopics: [String: Int]
    var timeOfDayDistribution: [String: Int]
}

struct ResponseQualityMetrics: Codable, Hashable {
    var averageConfidence: Double
    var averageRelevanceScore: Double
    var averageCompletenessScore: Double
    var averageHelpfulnessScore: Double
    var responseAccuracy: Double
    var hallucinationRate: Double
    var contextRetention: Double
    var responseConsistency: Double
}

struct ConversationMetrics: Codable, Hashable {
    var totalConversations: Int
    var averageConversationLength: Int // messages
    var conversationCompletionRate: Double
    var successfulTaskCompletions: Int
    var userFeedbackScore: Double
    var conversationTopics: [String: Int]
    var conversationSentiment: [String: Double]
}

// MARK: - Performance Analytics

struct AppPerformanceMetrics: Codable, Hashable {
    var averageLoadTime: TimeInterval
    var crashRate: Double
    var memoryUsage: Double // MB
    var batteryImpact: Double
    var networkLatency: TimeInterval
    var apiResponseTime: TimeInterval
    var offlineCapability: Double // percentage
}

struct FeatureUsageMetrics: Codable, Hashable {
    var featureAdoption: [String: Double]
    var featureEngagement: [String: Double]
    var featureRetention: [String: Double]
    var mostUsedFeatures: [String]
    var leastUsedFeatures: [String]
    var newFeatureAdoption: [String: Double]
    var featureDropOff: [String: Double]
}

struct ErrorMetrics: Codable, Hashable {
    var totalErrors: Int
    var errorRate: Double
    var errorsByType: [String: Int]
    var errorsByFeature: [String: Int]
    var criticalErrors: Int
    var errorResolutionTime: TimeInterval
    var userReportedIssues: Int
}

// MARK: - Business Analytics

struct RevenueMetrics: Codable, Hashable {
    var totalRevenue: Double
    var monthlyRecurringRevenue: Double
    var averageRevenuePerUser: Double
    var revenueBySource: [String: Double]
    var revenueGrowthRate: Double
    var seasonalRevenue: [String: Double]
    var currencyBreakdown: [String: Double]
}

struct ConversionMetrics: Codable, Hashable {
    var visitorToUserConversion: Double
    var userToTripPlannerConversion: Double
    var tripPlanToBookingConversion: Double
    var freeToPaidConversion: Double
    var overallConversionRate: Double
    var conversionByChannel: [String: Double]
    var conversionByDemographic: [String: Double]
}

struct RetentionMetrics: Codable, Hashable {
    var userRetentionRate: Double
    var cohortRetention: [String: Double]
    var churnPrediction: Double
    var lifetimeValue: Double
    var repeatBookingRate: Double
    var userLifetimeDays: Int
    var reactivationRate: Double
}

// MARK: - Validation and Helper Methods

extension AnalyticsData {
    func validate() throws {
        guard dateRange.start <= dateRange.end else {
            throw ValidationError.invalidDateRange
        }
        
        guard timestamp >= dateRange.start && timestamp <= dateRange.end else {
            throw ValidationError.invalidTimestamp
        }
        
        // Validate percentage values
        if let engagement = engagementMetrics {
            guard engagement.bounceRate >= 0 && engagement.bounceRate <= 1 else {
                throw ValidationError.invalidBounceRate
            }
        }
        
        if let quality = responseQualityMetrics {
            guard quality.averageConfidence >= 0 && quality.averageConfidence <= 1 else {
                throw ValidationError.invalidConfidence
            }
        }
    }
    
    enum ValidationError: LocalizedError {
        case invalidDateRange
        case invalidTimestamp
        case invalidBounceRate
        case invalidConfidence
        
        var errorDescription: String? {
            switch self {
            case .invalidDateRange: return "Date range start must be before or equal to end"
            case .invalidTimestamp: return "Timestamp must be within the specified date range"
            case .invalidBounceRate: return "Bounce rate must be between 0.0 and 1.0"
            case .invalidConfidence: return "Confidence score must be between 0.0 and 1.0"
            }
        }
    }
    
    static func mock() -> AnalyticsData {
        let dateRange = DateRange(
            start: Date().addingTimeInterval(-30*24*3600),
            end: Date()
        )
        
        return AnalyticsData(
            dateRange: dateRange,
            userMetrics: UserMetrics(
                totalUsers: 15420,
                newUsers: 1250,
                activeUsers: 8930,
                returningUsers: 6490,
                userGrowthRate: 8.5,
                churnRate: 3.2,
                averageSessionDuration: 420.0,
                usersByDevice: ["iPhone": 8920, "iPad": 2340, "Mac": 4160],
                usersByRegion: ["North America": 5420, "Europe": 4230, "Asia": 3890, "Other": 1880]
            ),
            engagementMetrics: EngagementMetrics(
                dailyActiveUsers: 2340,
                weeklyActiveUsers: 8930,
                monthlyActiveUsers: 12450,
                averageSessionsPerUser: 4.2,
                averagePageViewsPerSession: 8.7,
                bounceRate: 0.23,
                timeSpentInApp: 720.0,
                featureEngagement: [
                    "AI Chat": 0.85,
                    "Trip Planning": 0.72,
                    "Destination Search": 0.68,
                    "Booking": 0.45
                ]
            ),
            tripMetrics: TripMetrics(
                totalTrips: 8930,
                plannedTrips: 3450,
                completedTrips: 4230,
                cancelledTrips: 1250,
                averageTripDuration: 7,
                averageTripBudget: 1850.0,
                tripsByStatus: ["planned": 3450, "ongoing": 890, "completed": 4230, "cancelled": 1250],
                tripsBySeason: ["Spring": 2100, "Summer": 3200, "Fall": 2450, "Winter": 1180],
                popularTripTypes: ["City Break": 2800, "Beach Holiday": 2200, "Adventure": 1650, "Cultural": 1280]
            ),
            aiInteractionMetrics: AIInteractionMetrics(
                totalInteractions: 45670,
                totalConversations: 12340,
                averageMessagesPerConversation: 3.7,
                aiResponseTime: 1.2,
                userSatisfactionScore: 4.3,
                interactionTypes: ["Trip Planning": 4500, "Destination Info": 3800, "Booking Help": 2100, "General Chat": 2940],
                popularTopics: ["Flights": 3200, "Hotels": 2800, "Activities": 2400, "Weather": 1800],
                timeOfDayDistribution: ["Morning": 3200, "Afternoon": 4800, "Evening": 3600, "Night": 870]
            ),
            summary: AnalyticsSummary(
                totalUsers: 15420,
                totalTrips: 8930,
                totalRevenue: 2450000.0,
                averageTripValue: 1850.0,
                topDestinations: ["Tokyo", "Paris", "New York", "London", "Barcelona"],
                userSatisfactionScore: 4.3,
                aiAccuracyScore: 0.87,
                keyInsights: [
                    "AI chat engagement increased by 23% this month",
                    "Mobile bookings now represent 58% of total bookings",
                    "Average trip planning time reduced by 40% with AI assistance"
                ],
                recommendations: [
                    "Focus on expanding beach holiday packages",
                    "Improve AI response time for better user experience",
                    "Target European users for winter travel campaigns"
                ]
            )
        )
    }
}
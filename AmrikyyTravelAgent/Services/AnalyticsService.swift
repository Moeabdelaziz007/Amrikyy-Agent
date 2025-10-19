//
//  AnalyticsService.swift
//  AmrikyyTravelAgent
//
//  Created by CURSERO AI Agent
//  Copyright © 2025 AMRIKYY AI Solutions. All rights reserved.
//

import Foundation
import FirebaseAnalytics
import FirebaseCrashlytics
import Combine

/**
 * @class AnalyticsService
 * @description Enterprise-grade analytics and crash reporting service using Firebase
 * Provides comprehensive user behavior tracking and crash monitoring
 */
class AnalyticsService: ObservableObject {
    
    // MARK: - Singleton
    static let shared = AnalyticsService()
    
    // MARK: - Properties
    @Published var isAnalyticsEnabled: Bool = true
    @Published var isCrashReportingEnabled: Bool = true
    @Published var userProperties: [String: Any] = [:]
    
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    private init() {
        setupAnalytics()
        loadAnalyticsSettings()
    }
    
    // MARK: - Setup
    
    private func setupAnalytics() {
        // Configure analytics collection
        Analytics.setAnalyticsCollectionEnabled(isAnalyticsEnabled)
        
        // Configure crash reporting
        if isCrashReportingEnabled {
            Crashlytics.crashlytics().setCrashlyticsCollectionEnabled(true)
        }
    }
    
    private func loadAnalyticsSettings() {
        isAnalyticsEnabled = UserDefaults.standard.bool(forKey: "AnalyticsEnabled")
        isCrashReportingEnabled = UserDefaults.standard.bool(forKey: "CrashReportingEnabled")
    }
    
    // MARK: - Analytics Events
    
    /**
     * Track screen view
     * @param screenName: Name of the screen
     * @param screenClass: Class of the screen
     */
    func trackScreenView(screenName: String, screenClass: String? = nil) {
        guard isAnalyticsEnabled else { return }
        
        var parameters: [String: Any] = [
            AnalyticsParameterScreenName: screenName
        ]
        
        if let screenClass = screenClass {
            parameters[AnalyticsParameterScreenClass] = screenClass
        }
        
        Analytics.logEvent(AnalyticsEventScreenView, parameters: parameters)
    }
    
    /**
     * Track user action
     * @param action: Action name
     * @param parameters: Additional parameters
     */
    func trackAction(_ action: String, parameters: [String: Any] = [:]) {
        guard isAnalyticsEnabled else { return }
        
        Analytics.logEvent(action, parameters: parameters)
    }
    
    /**
     * Track trip creation
     * @param trip: Trip object
     */
    func trackTripCreation(_ trip: TravelPlan) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "trip_id": trip.id.uuidString,
            "destination": trip.destination,
            "budget": trip.budget,
            "travelers": trip.travelers,
            "duration_days": Calendar.current.dateComponents([.day], from: trip.startDate, to: trip.endDate).day ?? 0,
            "trip_status": trip.status.rawValue
        ]
        
        Analytics.logEvent("trip_created", parameters: parameters)
    }
    
    /**
     * Track trip update
     * @param trip: Trip object
     * @param updateType: Type of update
     */
    func trackTripUpdate(_ trip: TravelPlan, updateType: String) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "trip_id": trip.id.uuidString,
            "update_type": updateType,
            "destination": trip.destination
        ]
        
        Analytics.logEvent("trip_updated", parameters: parameters)
    }
    
    /**
     * Track booking creation
     * @param booking: Booking object
     */
    func trackBookingCreation(_ booking: Booking) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "booking_id": booking.id.uuidString,
            "trip_id": booking.tripId.uuidString,
            "booking_type": booking.type.rawValue,
            "amount": booking.amount,
            "currency": booking.currency,
            "provider": booking.provider ?? "unknown"
        ]
        
        Analytics.logEvent("booking_created", parameters: parameters)
    }
    
    /**
     * Track payment initiation
     * @param amount: Payment amount
     * @param currency: Payment currency
     * @param paymentMethod: Payment method used
     */
    func trackPaymentInitiated(amount: Double, currency: String, paymentMethod: String) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "amount": amount,
            "currency": currency,
            "payment_method": paymentMethod
        ]
        
        Analytics.logEvent("payment_initiated", parameters: parameters)
    }
    
    /**
     * Track payment completion
     * @param amount: Payment amount
     * @param currency: Payment currency
     * @param paymentMethod: Payment method used
     * @param success: Whether payment was successful
     */
    func trackPaymentCompleted(amount: Double, currency: String, paymentMethod: String, success: Bool) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "amount": amount,
            "currency": currency,
            "payment_method": paymentMethod,
            "success": success
        ]
        
        Analytics.logEvent("payment_completed", parameters: parameters)
    }
    
    /**
     * Track AI interaction
     * @param interactionType: Type of AI interaction
     * @param query: User query
     * @param responseTime: Response time in milliseconds
     */
    func trackAIInteraction(interactionType: String, query: String, responseTime: Int) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "interaction_type": interactionType,
            "query_length": query.count,
            "response_time_ms": responseTime
        ]
        
        Analytics.logEvent("ai_interaction", parameters: parameters)
    }
    
    /**
     * Track destination search
     * @param searchQuery: Search query
     * @param resultsCount: Number of results
     * @param selectedDestination: Selected destination
     */
    func trackDestinationSearch(searchQuery: String, resultsCount: Int, selectedDestination: String? = nil) {
        guard isAnalyticsEnabled else { return }
        
        var parameters: [String: Any] = [
            "search_query": searchQuery,
            "results_count": resultsCount,
            "has_selection": selectedDestination != nil
        ]
        
        if let destination = selectedDestination {
            parameters["selected_destination"] = destination
        }
        
        Analytics.logEvent("destination_search", parameters: parameters)
    }
    
    /**
     * Track budget analysis
     * @param tripBudget: Trip budget
     * @param analysisType: Type of analysis
     * @param recommendationsCount: Number of recommendations
     */
    func trackBudgetAnalysis(tripBudget: Double, analysisType: String, recommendationsCount: Int) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "trip_budget": tripBudget,
            "analysis_type": analysisType,
            "recommendations_count": recommendationsCount
        ]
        
        Analytics.logEvent("budget_analysis", parameters: parameters)
    }
    
    /**
     * Track notification interaction
     * @param notificationType: Type of notification
     * @param action: Action taken
     */
    func trackNotificationInteraction(notificationType: String, action: String) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "notification_type": notificationType,
            "action": action
        ]
        
        Analytics.logEvent("notification_interaction", parameters: parameters)
    }
    
    // MARK: - User Properties
    
    /**
     * Set user property
     * @param value: Property value
     * @param name: Property name
     */
    func setUserProperty(_ value: Any?, forName name: String) {
        guard isAnalyticsEnabled else { return }
        
        Analytics.setUserProperty(value as? String, forName: name)
        userProperties[name] = value
    }
    
    /**
     * Set user ID
     * @param userId: User identifier
     */
    func setUserId(_ userId: String) {
        guard isAnalyticsEnabled else { return }
        
        Analytics.setUserID(userId)
    }
    
    /**
     * Update user properties for trip planning
     * @param tripCount: Number of trips created
     * @param totalSpent: Total amount spent
     * @param favoriteDestination: Most visited destination
     */
    func updateUserTripProperties(tripCount: Int, totalSpent: Double, favoriteDestination: String? = nil) {
        setUserProperty(String(tripCount), forName: "trip_count")
        setUserProperty(String(totalSpent), forName: "total_spent")
        
        if let destination = favoriteDestination {
            setUserProperty(destination, forName: "favorite_destination")
        }
    }
    
    // MARK: - Crash Reporting
    
    /**
     * Log custom error
     * @param error: Error object
     * @param context: Additional context
     */
    func logError(_ error: Error, context: String = "") {
        guard isCrashReportingEnabled else { return }
        
        Crashlytics.crashlytics().record(error: error)
        
        if !context.isEmpty {
            Crashlytics.crashlytics().setCustomValue(context, forKey: "error_context")
        }
    }
    
    /**
     * Log custom message
     * @param message: Log message
     * @param level: Log level
     */
    func logMessage(_ message: String, level: LogLevel = .info) {
        guard isCrashReportingEnabled else { return }
        
        Crashlytics.crashlytics().log("\(level.rawValue.uppercased()): \(message)")
    }
    
    /**
     * Set custom key-value pair for crash context
     * @param value: Value to set
     * @param key: Key name
     */
    func setCustomValue(_ value: Any, forKey key: String) {
        guard isCrashReportingEnabled else { return }
        
        Crashlytics.crashlytics().setCustomValue(value, forKey: key)
    }
    
    /**
     * Set user identifier for crash reporting
     * @param userId: User identifier
     */
    func setCrashlyticsUserId(_ userId: String) {
        guard isCrashReportingEnabled else { return }
        
        Crashlytics.crashlytics().setUserID(userId)
    }
    
    // MARK: - Settings Management
    
    /**
     * Enable or disable analytics
     * @param enabled: Whether to enable analytics
     */
    func setAnalyticsEnabled(_ enabled: Bool) {
        isAnalyticsEnabled = enabled
        Analytics.setAnalyticsCollectionEnabled(enabled)
        UserDefaults.standard.set(enabled, forKey: "AnalyticsEnabled")
    }
    
    /**
     * Enable or disable crash reporting
     * @param enabled: Whether to enable crash reporting
     */
    func setCrashReportingEnabled(_ enabled: Bool) {
        isCrashReportingEnabled = enabled
        Crashlytics.crashlytics().setCrashlyticsCollectionEnabled(enabled)
        UserDefaults.standard.set(enabled, forKey: "CrashReportingEnabled")
    }
    
    // MARK: - Performance Tracking
    
    /**
     * Track app performance metrics
     * @param metric: Performance metric name
     * @param value: Metric value
     * @param unit: Unit of measurement
     */
    func trackPerformanceMetric(_ metric: String, value: Double, unit: String = "ms") {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "metric_name": metric,
            "metric_value": value,
            "metric_unit": unit
        ]
        
        Analytics.logEvent("performance_metric", parameters: parameters)
    }
    
    /**
     * Track API call performance
     * @param endpoint: API endpoint
     * @param method: HTTP method
     * @param responseTime: Response time in milliseconds
     * @param success: Whether the call was successful
     */
    func trackAPICall(endpoint: String, method: String, responseTime: Int, success: Bool) {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "endpoint": endpoint,
            "method": method,
            "response_time_ms": responseTime,
            "success": success
        ]
        
        Analytics.logEvent("api_call", parameters: parameters)
    }
    
    // MARK: - Conversion Tracking
    
    /**
     * Track conversion event
     * @param conversionType: Type of conversion
     * @param value: Conversion value
     * @param currency: Currency code
     */
    func trackConversion(conversionType: String, value: Double, currency: String = "USD") {
        guard isAnalyticsEnabled else { return }
        
        let parameters: [String: Any] = [
            "conversion_type": conversionType,
            "value": value,
            "currency": currency
        ]
        
        Analytics.logEvent("conversion", parameters: parameters)
    }
}

// MARK: - Enums

enum LogLevel: String, CaseIterable {
    case debug = "debug"
    case info = "info"
    case warning = "warning"
    case error = "error"
    case critical = "critical"
}

// MARK: - Extensions

extension AnalyticsService {
    
    /**
     * Track onboarding completion
     * @param step: Onboarding step completed
     * @param timeSpent: Time spent on step in seconds
     */
    func trackOnboardingStep(step: String, timeSpent: Int) {
        let parameters: [String: Any] = [
            "step": step,
            "time_spent_seconds": timeSpent
        ]
        
        Analytics.logEvent("onboarding_step", parameters: parameters)
    }
    
    /**
     * Track feature usage
     * @param feature: Feature name
     * @param usageCount: Number of times used
     */
    func trackFeatureUsage(feature: String, usageCount: Int = 1) {
        let parameters: [String: Any] = [
            "feature": feature,
            "usage_count": usageCount
        ]
        
        Analytics.logEvent("feature_usage", parameters: parameters)
    }
    
    /**
     * Track app lifecycle events
     * @param event: Lifecycle event
     */
    func trackAppLifecycle(_ event: AppLifecycleEvent) {
        let parameters: [String: Any] = [
            "event": event.rawValue,
            "timestamp": Date().timeIntervalSince1970
        ]
        
        Analytics.logEvent("app_lifecycle", parameters: parameters)
    }
}

enum AppLifecycleEvent: String, CaseIterable {
    case appLaunch = "app_launch"
    case appBackground = "app_background"
    case appForeground = "app_foreground"
    case appTerminate = "app_terminate"
}

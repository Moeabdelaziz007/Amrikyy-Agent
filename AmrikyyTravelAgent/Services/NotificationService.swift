//
//  NotificationService.swift
//  AmrikyyTravelAgent
//
//  Created by CURSERO AI Agent
//  Copyright © 2025 AMRIKYY AI Solutions. All rights reserved.
//

import Foundation
import Firebase
import FirebaseMessaging
import UserNotifications
import Combine

/**
 * @class NotificationService
 * @description Enterprise-grade push notification service using Firebase Cloud Messaging
 * Provides real-time notifications for bookings, trip updates, and promotions
 */
class NotificationService: NSObject, ObservableObject {
    
    // MARK: - Singleton
    static let shared = NotificationService()
    
    // MARK: - Properties
    @Published var isAuthorized: Bool = false
    @Published var fcmToken: String?
    @Published var notificationSettings: NotificationSettings = NotificationSettings()
    @Published var unreadCount: Int = 0
    
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Notification Settings
    struct NotificationSettings: Codable {
        var tripUpdates: Bool = true
        var bookingConfirmations: Bool = true
        var paymentNotifications: Bool = true
        var promotionalOffers: Bool = false
        var emergencyAlerts: Bool = true
        var quietHoursEnabled: Bool = false
        var quietHoursStart: Date = Calendar.current.date(from: DateComponents(hour: 22, minute: 0)) ?? Date()
        var quietHoursEnd: Date = Calendar.current.date(from: DateComponents(hour: 8, minute: 0)) ?? Date()
    }
    
    // MARK: - Initialization
    private override init() {
        super.init()
        setupFirebaseMessaging()
        setupNotificationCenter()
        loadNotificationSettings()
    }
    
    // MARK: - Firebase Setup
    private func setupFirebaseMessaging() {
        Messaging.messaging().delegate = self
        
        // Request FCM token
        Messaging.messaging().token { [weak self] token, error in
            if let error = error {
                print("Error fetching FCM token: \(error.localizedDescription)")
            } else if let token = token {
                DispatchQueue.main.async {
                    self?.fcmToken = token
                    print("FCM Token: \(token)")
                    // Send token to server
                    self?.sendTokenToServer(token)
                }
            }
        }
    }
    
    private func setupNotificationCenter() {
        UNUserNotificationCenter.current().delegate = self
        
        // Configure notification categories
        configureNotificationCategories()
    }
    
    // MARK: - Permission Management
    
    /**
     * Request notification permissions
     * @return: Promise with authorization status
     */
    func requestNotificationPermission() -> Future<Bool, Never> {
        return Future { promise in
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
                DispatchQueue.main.async {
                    self.isAuthorized = granted
                    if granted {
                        self.registerForRemoteNotifications()
                    }
                    promise(.success(granted))
                }
            }
        }
    }
    
    private func registerForRemoteNotifications() {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
    
    // MARK: - Token Management
    
    private func sendTokenToServer(_ token: String) {
        // Send FCM token to your backend server
        // This would typically be done through your API service
        print("Sending FCM token to server: \(token)")
        
        // Example API call (implement with your actual API service)
        /*
        APIService.shared.updateFCMToken(token) { result in
            switch result {
            case .success:
                print("FCM token updated successfully")
            case .failure(let error):
                print("Failed to update FCM token: \(error.localizedDescription)")
            }
        }
        */
    }
    
    // MARK: - Notification Categories
    
    private func configureNotificationCategories() {
        // Trip Update Category
        let tripUpdateAction = UNNotificationAction(
            identifier: "VIEW_TRIP",
            title: "View Trip",
            options: [.foreground]
        )
        
        let tripUpdateCategory = UNNotificationCategory(
            identifier: "TRIP_UPDATE",
            actions: [tripUpdateAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )
        
        // Booking Confirmation Category
        let bookingViewAction = UNNotificationAction(
            identifier: "VIEW_BOOKING",
            title: "View Booking",
            options: [.foreground]
        )
        
        let bookingCancelAction = UNNotificationAction(
            identifier: "CANCEL_BOOKING",
            title: "Cancel",
            options: [.destructive]
        )
        
        let bookingCategory = UNNotificationCategory(
            identifier: "BOOKING_CONFIRMATION",
            actions: [bookingViewAction, bookingCancelAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )
        
        // Payment Notification Category
        let paymentViewAction = UNNotificationAction(
            identifier: "VIEW_PAYMENT",
            title: "View Payment",
            options: [.foreground]
        )
        
        let paymentCategory = UNNotificationCategory(
            identifier: "PAYMENT_NOTIFICATION",
            actions: [paymentViewAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )
        
        // Emergency Alert Category
        let emergencyAcknowledgeAction = UNNotificationAction(
            identifier: "ACKNOWLEDGE_EMERGENCY",
            title: "Acknowledge",
            options: [.foreground]
        )
        
        let emergencyCategory = UNNotificationCategory(
            identifier: "EMERGENCY_ALERT",
            actions: [emergencyAcknowledgeAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )
        
        // Register categories
        UNUserNotificationCenter.current().setNotificationCategories([
            tripUpdateCategory,
            bookingCategory,
            paymentCategory,
            emergencyCategory
        ])
    }
    
    // MARK: - Local Notifications
    
    /**
     * Schedule local notification
     * @param title: Notification title
     * @param body: Notification body
     * @param category: Notification category
     * @param userInfo: Additional data
     * @param timeInterval: Delay in seconds
     */
    func scheduleLocalNotification(
        title: String,
        body: String,
        category: String = "GENERAL",
        userInfo: [String: Any] = [:],
        timeInterval: TimeInterval = 1.0
    ) {
        guard isAuthorized else { return }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.categoryIdentifier = category
        content.userInfo = userInfo
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error scheduling notification: \(error.localizedDescription)")
            }
        }
    }
    
    /**
     * Schedule trip reminder notification
     * @param trip: Trip object
     * @param reminderType: Type of reminder
     */
    func scheduleTripReminder(for trip: TravelPlan, reminderType: TripReminderType) {
        let title: String
        let body: String
        let timeInterval: TimeInterval
        
        switch reminderType {
        case .dayBefore:
            title = "Trip Tomorrow!"
            body = "Your trip to \(trip.destination) starts tomorrow. Don't forget to pack!"
            timeInterval = trip.startDate.timeIntervalSinceNow - 24 * 60 * 60
            
        case .weekBefore:
            title = "Trip Next Week"
            body = "Your trip to \(trip.destination) is coming up. Time to start planning!"
            timeInterval = trip.startDate.timeIntervalSinceNow - 7 * 24 * 60 * 60
            
        case .checkIn:
            title = "Check-in Available"
            body = "Check-in is now available for your trip to \(trip.destination)"
            timeInterval = trip.startDate.timeIntervalSinceNow - 24 * 60 * 60
        }
        
        guard timeInterval > 0 else { return }
        
        scheduleLocalNotification(
            title: title,
            body: body,
            category: "TRIP_UPDATE",
            userInfo: ["tripId": trip.id.uuidString],
            timeInterval: timeInterval
        )
    }
    
    // MARK: - Settings Management
    
    func updateNotificationSettings(_ settings: NotificationSettings) {
        notificationSettings = settings
        saveNotificationSettings()
        
        // Update server with new preferences
        sendSettingsToServer(settings)
    }
    
    private func saveNotificationSettings() {
        if let data = try? JSONEncoder().encode(notificationSettings) {
            UserDefaults.standard.set(data, forKey: "NotificationSettings")
        }
    }
    
    private func loadNotificationSettings() {
        if let data = UserDefaults.standard.data(forKey: "NotificationSettings"),
           let settings = try? JSONDecoder().decode(NotificationSettings.self, from: data) {
            notificationSettings = settings
        }
    }
    
    private func sendSettingsToServer(_ settings: NotificationSettings) {
        // Send notification preferences to server
        print("Sending notification settings to server")
        
        /*
        APIService.shared.updateNotificationSettings(settings) { result in
            switch result {
            case .success:
                print("Notification settings updated successfully")
            case .failure(let error):
                print("Failed to update notification settings: \(error.localizedDescription)")
            }
        }
        */
    }
    
    // MARK: - Badge Management
    
    func updateBadgeCount(_ count: Int) {
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber = count
            self.unreadCount = count
        }
    }
    
    func clearBadge() {
        updateBadgeCount(0)
    }
    
    // MARK: - Notification Handling
    
    func handleNotification(_ userInfo: [AnyHashable: Any]) {
        guard let notificationType = userInfo["type"] as? String else { return }
        
        switch notificationType {
        case "trip_update":
            handleTripUpdateNotification(userInfo)
        case "booking_confirmation":
            handleBookingConfirmationNotification(userInfo)
        case "payment_notification":
            handlePaymentNotification(userInfo)
        case "emergency_alert":
            handleEmergencyAlertNotification(userInfo)
        default:
            print("Unknown notification type: \(notificationType)")
        }
    }
    
    private func handleTripUpdateNotification(_ userInfo: [AnyHashable: Any]) {
        guard let tripId = userInfo["tripId"] as? String else { return }
        print("Handling trip update notification for trip: \(tripId)")
        // Navigate to trip details or refresh trip data
    }
    
    private func handleBookingConfirmationNotification(_ userInfo: [AnyHashable: Any]) {
        guard let bookingId = userInfo["bookingId"] as? String else { return }
        print("Handling booking confirmation notification for booking: \(bookingId)")
        // Navigate to booking details or refresh booking data
    }
    
    private func handlePaymentNotification(_ userInfo: [AnyHashable: Any]) {
        guard let paymentId = userInfo["paymentId"] as? String else { return }
        print("Handling payment notification for payment: \(paymentId)")
        // Navigate to payment details or refresh payment status
    }
    
    private func handleEmergencyAlertNotification(_ userInfo: [AnyHashable: Any]) {
        print("Handling emergency alert notification")
        // Show emergency alert or navigate to emergency information
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension NotificationService: UNUserNotificationCenterDelegate {
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.alert, .badge, .sound])
    }
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        handleNotification(userInfo)
        
        // Handle action responses
        switch response.actionIdentifier {
        case "VIEW_TRIP":
            if let tripId = userInfo["tripId"] as? String {
                // Navigate to trip details
                print("Navigate to trip: \(tripId)")
            }
        case "VIEW_BOOKING":
            if let bookingId = userInfo["bookingId"] as? String {
                // Navigate to booking details
                print("Navigate to booking: \(bookingId)")
            }
        case "VIEW_PAYMENT":
            if let paymentId = userInfo["paymentId"] as? String {
                // Navigate to payment details
                print("Navigate to payment: \(paymentId)")
            }
        case "CANCEL_BOOKING":
            if let bookingId = userInfo["bookingId"] as? String {
                // Cancel booking
                print("Cancel booking: \(bookingId)")
            }
        case "ACKNOWLEDGE_EMERGENCY":
            // Acknowledge emergency
            print("Emergency acknowledged")
        default:
            break
        }
        
        completionHandler()
    }
}

// MARK: - MessagingDelegate

extension NotificationService: MessagingDelegate {
    
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("Firebase registration token: \(String(describing: fcmToken))")
        
        DispatchQueue.main.async {
            self.fcmToken = fcmToken
            if let token = fcmToken {
                self.sendTokenToServer(token)
            }
        }
    }
}

// MARK: - Enums

enum TripReminderType {
    case dayBefore
    case weekBefore
    case checkIn
}

// MARK: - Extensions

extension NotificationService.NotificationSettings {
    enum CodingKeys: String, CodingKey {
        case tripUpdates
        case bookingConfirmations
        case paymentNotifications
        case promotionalOffers
        case emergencyAlerts
        case quietHoursEnabled
        case quietHoursStart
        case quietHoursEnd
    }
}
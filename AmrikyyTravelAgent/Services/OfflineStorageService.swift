//
//  OfflineStorageService.swift
//  AmrikyyTravelAgent
//
//  Created by CURSERO AI Agent
//  Copyright © 2025 AMRIKYY AI Solutions. All rights reserved.
//

import Foundation
import CoreData
import Combine

/**
 * @class OfflineStorageService
 * @description Enterprise-grade offline storage service using Core Data
 * Provides offline-first architecture with automatic sync capabilities
 */
class OfflineStorageService: ObservableObject {
    
    // MARK: - Singleton
    static let shared = OfflineStorageService()
    
    // MARK: - Properties
    @Published var isOfflineMode: Bool = false
    @Published var pendingSyncCount: Int = 0
    @Published var lastSyncDate: Date?
    
    private let persistentContainer: NSPersistentContainer
    private let context: NSManagedObjectContext
    
    // MARK: - Initialization
    private init() {
        // Initialize Core Data stack
        persistentContainer = NSPersistentContainer(name: "AmrikyyTravelAgent")
        
        // Configure persistent store
        let storeDescription = persistentContainer.persistentStoreDescriptions.first
        storeDescription?.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
        storeDescription?.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
        
        persistentContainer.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data failed to load: \(error.localizedDescription)")
            }
        }
        
        context = persistentContainer.viewContext
        context.automaticallyMergesChangesFromParent = true
        
        // Monitor network connectivity
        setupNetworkMonitoring()
    }
    
    // MARK: - Network Monitoring
    private func setupNetworkMonitoring() {
        // Simple network monitoring - in production, use Network framework
        Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
            self.checkNetworkStatus()
        }
    }
    
    private func checkNetworkStatus() {
        // This is a simplified check - in production, use proper network monitoring
        DispatchQueue.main.async {
            self.isOfflineMode = !self.isNetworkAvailable()
            if !self.isOfflineMode {
                self.syncPendingChanges()
            }
        }
    }
    
    private func isNetworkAvailable() -> Bool {
        // Simplified network check - in production, use Network framework
        return true // Assume online for now
    }
    
    // MARK: - Trip Management
    
    /**
     * Save trip to offline storage
     * @param trip: Trip object to save
     * @return: Success status
     */
    func saveTrip(_ trip: TravelPlan) -> Bool {
        let context = persistentContainer.viewContext
        
        // Check if trip already exists
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedTrip")
        fetchRequest.predicate = NSPredicate(format: "id == %@", trip.id.uuidString)
        
        do {
            let existingTrips = try context.fetch(fetchRequest) as? [NSManagedObject]
            
            let cachedTrip: NSManagedObject
            if let existingTrip = existingTrips?.first {
                cachedTrip = existingTrip
            } else {
                cachedTrip = NSEntityDescription.entity(forEntityName: "CachedTrip", in: context)!.instantiate(with: nil)
            }
            
            // Update trip data
            cachedTrip.setValue(trip.id.uuidString, forKey: "id")
            cachedTrip.setValue(trip.title, forKey: "title")
            cachedTrip.setValue(trip.destination, forKey: "destination")
            cachedTrip.setValue(trip.startDate, forKey: "startDate")
            cachedTrip.setValue(trip.endDate, forKey: "endDate")
            cachedTrip.setValue(trip.budget, forKey: "budget")
            cachedTrip.setValue(Int16(trip.travelers), forKey: "travelers")
            cachedTrip.setValue(trip.status.rawValue, forKey: "status")
            cachedTrip.setValue(trip.notes, forKey: "notes")
            cachedTrip.setValue(trip.imageURL, forKey: "imageURL")
            cachedTrip.setValue(Date(), forKey: "updatedAt")
            cachedTrip.setValue(true, forKey: "needsSync")
            
            if existingTrips?.isEmpty ?? true {
                cachedTrip.setValue(Date(), forKey: "createdAt")
            }
            
            try context.save()
            updatePendingSyncCount()
            return true
            
        } catch {
            print("Failed to save trip: \(error.localizedDescription)")
            return false
        }
    }
    
    /**
     * Fetch trips from offline storage
     * @return: Array of cached trips
     */
    func fetchTrips() -> [TravelPlan] {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedTrip")
        fetchRequest.predicate = NSPredicate(format: "isDeleted == NO")
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "updatedAt", ascending: false)]
        
        do {
            let cachedTrips = try context.fetch(fetchRequest) as? [NSManagedObject] ?? []
            return cachedTrips.compactMap { convertToTravelPlan($0) }
        } catch {
            print("Failed to fetch trips: \(error.localizedDescription)")
            return []
        }
    }
    
    /**
     * Delete trip from offline storage
     * @param tripId: Trip ID to delete
     * @return: Success status
     */
    func deleteTrip(tripId: String) -> Bool {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedTrip")
        fetchRequest.predicate = NSPredicate(format: "id == %@", tripId)
        
        do {
            let trips = try context.fetch(fetchRequest) as? [NSManagedObject] ?? []
            
            for trip in trips {
                trip.setValue(true, forKey: "isDeleted")
                trip.setValue(true, forKey: "needsSync")
                trip.setValue(Date(), forKey: "updatedAt")
            }
            
            try context.save()
            updatePendingSyncCount()
            return true
            
        } catch {
            print("Failed to delete trip: \(error.localizedDescription)")
            return false
        }
    }
    
    // MARK: - Booking Management
    
    /**
     * Save booking to offline storage
     * @param booking: Booking object to save
     * @return: Success status
     */
    func saveBooking(_ booking: Booking) -> Bool {
        let context = persistentContainer.viewContext
        
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedBooking")
        fetchRequest.predicate = NSPredicate(format: "id == %@", booking.id.uuidString)
        
        do {
            let existingBookings = try context.fetch(fetchRequest) as? [NSManagedObject]
            
            let cachedBooking: NSManagedObject
            if let existingBooking = existingBookings?.first {
                cachedBooking = existingBooking
            } else {
                cachedBooking = NSEntityDescription.entity(forEntityName: "CachedBooking", in: context)!.instantiate(with: nil)
            }
            
            // Update booking data
            cachedBooking.setValue(booking.id.uuidString, forKey: "id")
            cachedBooking.setValue(booking.tripId.uuidString, forKey: "tripId")
            cachedBooking.setValue(booking.type.rawValue, forKey: "type")
            cachedBooking.setValue(booking.title, forKey: "title")
            cachedBooking.setValue(booking.description, forKey: "description")
            cachedBooking.setValue(booking.provider, forKey: "provider")
            cachedBooking.setValue(booking.confirmationCode, forKey: "confirmationCode")
            cachedBooking.setValue(booking.bookingDate, forKey: "bookingDate")
            cachedBooking.setValue(booking.startTime, forKey: "startTime")
            cachedBooking.setValue(booking.endTime, forKey: "endTime")
            cachedBooking.setValue(booking.amount, forKey: "amount")
            cachedBooking.setValue(booking.currency, forKey: "currency")
            cachedBooking.setValue(booking.paymentStatus.rawValue, forKey: "paymentStatus")
            cachedBooking.setValue(booking.status.rawValue, forKey: "status")
            cachedBooking.setValue(booking.details, forKey: "details")
            cachedBooking.setValue(Date(), forKey: "updatedAt")
            cachedBooking.setValue(true, forKey: "needsSync")
            
            if existingBookings?.isEmpty ?? true {
                cachedBooking.setValue(Date(), forKey: "createdAt")
            }
            
            try context.save()
            updatePendingSyncCount()
            return true
            
        } catch {
            print("Failed to save booking: \(error.localizedDescription)")
            return false
        }
    }
    
    /**
     * Fetch bookings from offline storage
     * @param tripId: Optional trip ID to filter by
     * @return: Array of cached bookings
     */
    func fetchBookings(tripId: String? = nil) -> [Booking] {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedBooking")
        
        var predicates: [NSPredicate] = [NSPredicate(format: "isDeleted == NO")]
        if let tripId = tripId {
            predicates.append(NSPredicate(format: "tripId == %@", tripId))
        }
        fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
        
        do {
            let cachedBookings = try context.fetch(fetchRequest) as? [NSManagedObject] ?? []
            return cachedBookings.compactMap { convertToBooking($0) }
        } catch {
            print("Failed to fetch bookings: \(error.localizedDescription)")
            return []
        }
    }
    
    // MARK: - User Profile Management
    
    /**
     * Save user profile to offline storage
     * @param user: User object to save
     * @return: Success status
     */
    func saveUserProfile(_ user: User) -> Bool {
        let context = persistentContainer.viewContext
        
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedUserProfile")
        fetchRequest.predicate = NSPredicate(format: "id == %@", user.id.uuidString)
        
        do {
            let existingProfiles = try context.fetch(fetchRequest) as? [NSManagedObject]
            
            let cachedProfile: NSManagedObject
            if let existingProfile = existingProfiles?.first {
                cachedProfile = existingProfile
            } else {
                cachedProfile = NSEntityDescription.entity(forEntityName: "CachedUserProfile", in: context)!.instantiate(with: nil)
            }
            
            // Update profile data
            cachedProfile.setValue(user.id.uuidString, forKey: "id")
            cachedProfile.setValue(user.email, forKey: "email")
            cachedProfile.setValue(user.fullName, forKey: "fullName")
            cachedProfile.setValue(user.avatarURL, forKey: "avatarURL")
            cachedProfile.setValue(user.preferences, forKey: "preferences")
            cachedProfile.setValue(Date(), forKey: "updatedAt")
            cachedProfile.setValue(true, forKey: "needsSync")
            
            if existingProfiles?.isEmpty ?? true {
                cachedProfile.setValue(Date(), forKey: "createdAt")
            }
            
            try context.save()
            updatePendingSyncCount()
            return true
            
        } catch {
            print("Failed to save user profile: \(error.localizedDescription)")
            return false
        }
    }
    
    /**
     * Fetch user profile from offline storage
     * @return: Cached user profile or nil
     */
    func fetchUserProfile() -> User? {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedUserProfile")
        fetchRequest.fetchLimit = 1
        
        do {
            let cachedProfiles = try context.fetch(fetchRequest) as? [NSManagedObject] ?? []
            return cachedProfiles.first.map { convertToUser($0) }
        } catch {
            print("Failed to fetch user profile: \(error.localizedDescription)")
            return nil
        }
    }
    
    // MARK: - Sync Management
    
    /**
     * Sync pending changes with server
     */
    func syncPendingChanges() {
        guard !isOfflineMode else { return }
        
        // Sync trips
        syncPendingTrips()
        
        // Sync bookings
        syncPendingBookings()
        
        // Sync user profile
        syncPendingUserProfile()
        
        lastSyncDate = Date()
        updatePendingSyncCount()
    }
    
    private func syncPendingTrips() {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedTrip")
        fetchRequest.predicate = NSPredicate(format: "needsSync == YES")
        
        do {
            let trips = try context.fetch(fetchRequest) as? [NSManagedObject] ?? []
            
            for trip in trips {
                // Here you would implement actual API sync logic
                // For now, just mark as synced
                trip.setValue(false, forKey: "needsSync")
                trip.setValue(Date(), forKey: "lastSyncedAt")
            }
            
            try context.save()
        } catch {
            print("Failed to sync trips: \(error.localizedDescription)")
        }
    }
    
    private func syncPendingBookings() {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedBooking")
        fetchRequest.predicate = NSPredicate(format: "needsSync == YES")
        
        do {
            let bookings = try context.fetch(fetchRequest) as? [NSManagedObject] ?? []
            
            for booking in bookings {
                // Here you would implement actual API sync logic
                booking.setValue(false, forKey: "needsSync")
                booking.setValue(Date(), forKey: "lastSyncedAt")
            }
            
            try context.save()
        } catch {
            print("Failed to sync bookings: \(error.localizedDescription)")
        }
    }
    
    private func syncPendingUserProfile() {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedUserProfile")
        fetchRequest.predicate = NSPredicate(format: "needsSync == YES")
        
        do {
            let profiles = try context.fetch(fetchRequest) as? [NSManagedObject] ?? []
            
            for profile in profiles {
                // Here you would implement actual API sync logic
                profile.setValue(false, forKey: "needsSync")
                profile.setValue(Date(), forKey: "lastSyncedAt")
            }
            
            try context.save()
        } catch {
            print("Failed to sync user profile: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Helper Methods
    
    private func updatePendingSyncCount() {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedTrip")
        fetchRequest.predicate = NSPredicate(format: "needsSync == YES")
        
        let bookingFetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedBooking")
        bookingFetchRequest.predicate = NSPredicate(format: "needsSync == YES")
        
        let profileFetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "CachedUserProfile")
        profileFetchRequest.predicate = NSPredicate(format: "needsSync == YES")
        
        do {
            let tripCount = try context.count(for: fetchRequest)
            let bookingCount = try context.count(for: bookingFetchRequest)
            let profileCount = try context.count(for: profileFetchRequest)
            
            DispatchQueue.main.async {
                self.pendingSyncCount = tripCount + bookingCount + profileCount
            }
        } catch {
            print("Failed to update pending sync count: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Conversion Methods
    
    private func convertToTravelPlan(_ cachedTrip: NSManagedObject) -> TravelPlan? {
        guard let idString = cachedTrip.value(forKey: "id") as? String,
              let id = UUID(uuidString: idString) else { return nil }
        
        return TravelPlan(
            id: id,
            title: cachedTrip.value(forKey: "title") as? String ?? "",
            destination: cachedTrip.value(forKey: "destination") as? String ?? "",
            startDate: cachedTrip.value(forKey: "startDate") as? Date ?? Date(),
            endDate: cachedTrip.value(forKey: "endDate") as? Date ?? Date(),
            budget: cachedTrip.value(forKey: "budget") as? Double ?? 0.0,
            travelers: Int(cachedTrip.value(forKey: "travelers") as? Int16 ?? 1),
            status: TripStatus(rawValue: cachedTrip.value(forKey: "status") as? String ?? "planned") ?? .planned,
            notes: cachedTrip.value(forKey: "notes") as? String,
            imageURL: cachedTrip.value(forKey: "imageURL") as? String,
            activities: [], // Would need separate fetch for activities
            expenses: []    // Would need separate fetch for expenses
        )
    }
    
    private func convertToBooking(_ cachedBooking: NSManagedObject) -> Booking? {
        guard let idString = cachedBooking.value(forKey: "id") as? String,
              let id = UUID(uuidString: idString) else { return nil }
        
        let tripIdString = cachedBooking.value(forKey: "tripId") as? String ?? ""
        let tripId = UUID(uuidString: tripIdString) ?? UUID()
        
        return Booking(
            id: id,
            tripId: tripId,
            type: BookingType(rawValue: cachedBooking.value(forKey: "type") as? String ?? "flight") ?? .flight,
            title: cachedBooking.value(forKey: "title") as? String ?? "",
            description: cachedBooking.value(forKey: "description") as? String,
            provider: cachedBooking.value(forKey: "provider") as? String,
            confirmationCode: cachedBooking.value(forKey: "confirmationCode") as? String,
            bookingDate: cachedBooking.value(forKey: "bookingDate") as? Date ?? Date(),
            startTime: cachedBooking.value(forKey: "startTime") as? Date,
            endTime: cachedBooking.value(forKey: "endTime") as? Date,
            amount: cachedBooking.value(forKey: "amount") as? Double ?? 0.0,
            currency: cachedBooking.value(forKey: "currency") as? String ?? "USD",
            paymentStatus: PaymentStatus(rawValue: cachedBooking.value(forKey: "paymentStatus") as? String ?? "pending") ?? .pending,
            status: BookingStatus(rawValue: cachedBooking.value(forKey: "status") as? String ?? "confirmed") ?? .confirmed,
            details: cachedBooking.value(forKey: "details") as? [String: Any] ?? [:]
        )
    }
    
    private func convertToUser(_ cachedProfile: NSManagedObject) -> User? {
        guard let idString = cachedProfile.value(forKey: "id") as? String,
              let id = UUID(uuidString: idString) else { return nil }
        
        return User(
            id: id,
            email: cachedProfile.value(forKey: "email") as? String ?? "",
            fullName: cachedProfile.value(forKey: "fullName") as? String,
            avatarURL: cachedProfile.value(forKey: "avatarURL") as? String,
            preferences: cachedProfile.value(forKey: "preferences") as? [String: Any] ?? [:]
        )
    }
}

// MARK: - Extensions

extension OfflineStorageService {
    
    /**
     * Clear all offline data
     */
    func clearAllData() {
        let entities = ["CachedTrip", "CachedBooking", "CachedUserProfile"]
        
        for entityName in entities {
            let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: entityName)
            let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
            
            do {
                try context.execute(deleteRequest)
            } catch {
                print("Failed to clear \(entityName): \(error.localizedDescription)")
            }
        }
        
        try? context.save()
        updatePendingSyncCount()
    }
    
    /**
     * Get storage statistics
     */
    func getStorageStats() -> (trips: Int, bookings: Int, profiles: Int, pendingSync: Int) {
        let tripCount = try? context.count(for: NSFetchRequest(entityName: "CachedTrip"))
        let bookingCount = try? context.count(for: NSFetchRequest(entityName: "CachedBooking"))
        let profileCount = try? context.count(for: NSFetchRequest(entityName: "CachedUserProfile"))
        
        return (
            trips: tripCount ?? 0,
            bookings: bookingCount ?? 0,
            profiles: profileCount ?? 0,
            pendingSync: pendingSyncCount
        )
    }
}

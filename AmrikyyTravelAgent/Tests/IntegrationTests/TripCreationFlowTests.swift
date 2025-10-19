//
//  TripCreationFlowTests.swift
//  AmrikyyTravelAgentIntegrationTests
//
//  Created by CURSERO AI Agent
//  Copyright © 2025 AMRIKYY AI Solutions. All rights reserved.
//

import XCTest
import SwiftUI
@testable import AmrikyyTravelAgent

/**
 * @class TripCreationFlowTests
 * @description Integration tests for the complete trip creation flow
 * Tests create → view → edit trip journey end-to-end
 */
class TripCreationFlowTests: XCTestCase {
    
    var app: XCUIApplication!
    var tripService: TripService!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
        
        tripService = TripService.shared
        
        // Ensure user is authenticated
        performLoginIfNeeded()
    }
    
    override func tearDownWithError() throws {
        app = nil
        tripService = nil
    }
    
    // MARK: - Trip Creation Flow Tests
    
    /**
     * Test complete trip creation flow
     * Create → View → Edit → Save
     */
    func testCompleteTripCreationFlow() throws {
        // Given: User is authenticated and on home screen
        XCTAssertTrue(app.navigationBars["Home"].exists)
        
        // When: User navigates to trip planner
        let tripPlannerTab = app.tabBars.buttons["Trip Planner"]
        tripPlannerTab.tap()
        
        // Then: Trip planner screen should be visible
        XCTAssertTrue(app.navigationBars["Trip Planner"].exists)
        
        // When: User creates a new trip
        let createTripButton = app.buttons["Create Trip"]
        XCTAssertTrue(createTripButton.exists)
        createTripButton.tap()
        
        // Then: Trip creation screen should be visible
        XCTAssertTrue(app.navigationBars["Create Trip"].exists)
        
        // When: User fills in trip details
        fillTripDetails()
        
        // And: User saves the trip
        let saveButton = app.buttons["Save Trip"]
        saveButton.tap()
        
        // Then: Trip should be created and user should see trip details
        XCTAssertTrue(app.navigationBars["Trip Details"].exists)
        
        // When: User edits the trip
        let editButton = app.buttons["Edit"]
        XCTAssertTrue(editButton.exists)
        editButton.tap()
        
        // Then: Edit screen should be visible
        XCTAssertTrue(app.navigationBars["Edit Trip"].exists)
        
        // When: User modifies trip details
        modifyTripDetails()
        
        // And: User saves changes
        let saveChangesButton = app.buttons["Save Changes"]
        saveChangesButton.tap()
        
        // Then: Changes should be saved and user should see updated trip
        XCTAssertTrue(app.navigationBars["Trip Details"].exists)
    }
    
    /**
     * Test trip creation with AI suggestions
     */
    func testTripCreationWithAISuggestions() throws {
        // Given: User is on trip creation screen
        navigateToTripCreation()
        
        // When: User enters destination
        let destinationField = app.textFields["Destination"]
        destinationField.tap()
        destinationField.typeText("Paris")
        
        // Then: AI suggestions should appear
        let suggestionsButton = app.buttons["Get AI Suggestions"]
        XCTAssertTrue(suggestionsButton.exists)
        suggestionsButton.tap()
        
        // And: AI suggestions should be displayed
        let suggestionsView = app.otherElements["AI Suggestions"]
        XCTAssertTrue(suggestionsView.waitForExistence(timeout: 10.0))
        
        // When: User selects a suggestion
        let suggestionButton = app.buttons["Use This Suggestion"]
        XCTAssertTrue(suggestionButton.exists)
        suggestionButton.tap()
        
        // Then: Trip details should be populated
        XCTAssertTrue(app.textFields["Paris"].exists)
    }
    
    /**
     * Test trip creation validation
     */
    func testTripCreationValidation() throws {
        // Given: User is on trip creation screen
        navigateToTripCreation()
        
        // When: User tries to save without required fields
        let saveButton = app.buttons["Save Trip"]
        saveButton.tap()
        
        // Then: Validation errors should be displayed
        let errorAlert = app.alerts["Validation Error"]
        XCTAssertTrue(errorAlert.waitForExistence(timeout: 5.0))
        
        // When: User dismisses error
        errorAlert.buttons["OK"].tap()
        
        // Then: User should still be on creation screen
        XCTAssertTrue(app.navigationBars["Create Trip"].exists)
    }
    
    /**
     * Test trip deletion
     */
    func testTripDeletion() throws {
        // Given: User has created a trip
        createTestTrip()
        
        // When: User navigates to trip details
        let tripCard = app.otherElements["Trip Card"].firstMatch
        XCTAssertTrue(tripCard.exists)
        tripCard.tap()
        
        // And: User deletes the trip
        let deleteButton = app.buttons["Delete Trip"]
        XCTAssertTrue(deleteButton.exists)
        deleteButton.tap()
        
        // Then: Confirmation alert should appear
        let confirmAlert = app.alerts["Delete Trip"]
        XCTAssertTrue(confirmAlert.waitForExistence(timeout: 5.0))
        
        // When: User confirms deletion
        confirmAlert.buttons["Delete"].tap()
        
        // Then: Trip should be deleted and user should see trip list
        XCTAssertTrue(app.navigationBars["Trip Planner"].exists)
    }
    
    /**
     * Test trip sharing
     */
    func testTripSharing() throws {
        // Given: User has created a trip
        createTestTrip()
        
        // When: User navigates to trip details
        let tripCard = app.otherElements["Trip Card"].firstMatch
        tripCard.tap()
        
        // And: User shares the trip
        let shareButton = app.buttons["Share Trip"]
        XCTAssertTrue(shareButton.exists)
        shareButton.tap()
        
        // Then: Share sheet should appear
        let shareSheet = app.sheets["Share Trip"]
        XCTAssertTrue(shareSheet.waitForExistence(timeout: 5.0))
        
        // When: User cancels sharing
        shareSheet.buttons["Cancel"].tap()
        
        // Then: User should return to trip details
        XCTAssertTrue(app.navigationBars["Trip Details"].exists)
    }
    
    // MARK: - Helper Methods
    
    private func performLoginIfNeeded() {
        if !app.navigationBars["Home"].exists {
            let emailField = app.textFields["Email"]
            let passwordField = app.secureTextFields["Password"]
            
            emailField.tap()
            emailField.typeText("test@example.com")
            
            passwordField.tap()
            passwordField.typeText("testpassword")
            
            let loginButton = app.buttons["Login"]
            loginButton.tap()
            
            let homeNavigationBar = app.navigationBars["Home"]
            XCTAssertTrue(homeNavigationBar.waitForExistence(timeout: 10.0))
        }
    }
    
    private func navigateToTripCreation() {
        let tripPlannerTab = app.tabBars.buttons["Trip Planner"]
        tripPlannerTab.tap()
        
        let createTripButton = app.buttons["Create Trip"]
        createTripButton.tap()
    }
    
    private func fillTripDetails() {
        // Fill destination
        let destinationField = app.textFields["Destination"]
        destinationField.tap()
        destinationField.typeText("Tokyo")
        
        // Fill start date
        let startDateField = app.textFields["Start Date"]
        startDateField.tap()
        startDateField.typeText("2025-12-01")
        
        // Fill end date
        let endDateField = app.textFields["End Date"]
        endDateField.tap()
        endDateField.typeText("2025-12-07")
        
        // Fill budget
        let budgetField = app.textFields["Budget"]
        budgetField.tap()
        budgetField.typeText("5000")
        
        // Fill travelers
        let travelersField = app.textFields["Travelers"]
        travelersField.tap()
        travelersField.typeText("2")
        
        // Fill notes
        let notesField = app.textViews["Notes"]
        notesField.tap()
        notesField.typeText("First time visiting Japan!")
    }
    
    private func modifyTripDetails() {
        // Modify destination
        let destinationField = app.textFields["Tokyo"]
        destinationField.tap()
        destinationField.clearText()
        destinationField.typeText("Osaka")
        
        // Modify budget
        let budgetField = app.textFields["5000"]
        budgetField.tap()
        budgetField.clearText()
        budgetField.typeText("6000")
    }
    
    private func createTestTrip() {
        navigateToTripCreation()
        fillTripDetails()
        
        let saveButton = app.buttons["Save Trip"]
        saveButton.tap()
        
        let tripDetailsNavigationBar = app.navigationBars["Trip Details"]
        XCTAssertTrue(tripDetailsNavigationBar.waitForExistence(timeout: 10.0))
    }
}

// MARK: - Performance Tests

extension TripCreationFlowTests {
    
    /**
     * Test trip creation performance
     */
    func testTripCreationPerformance() throws {
        measure {
            navigateToTripCreation()
            fillTripDetails()
            
            let saveButton = app.buttons["Save Trip"]
            saveButton.tap()
            
            let tripDetailsNavigationBar = app.navigationBars["Trip Details"]
            XCTAssertTrue(tripDetailsNavigationBar.waitForExistence(timeout: 10.0))
        }
    }
    
    /**
     * Test AI suggestions performance
     */
    func testAISuggestionsPerformance() throws {
        navigateToTripCreation()
        
        let destinationField = app.textFields["Destination"]
        destinationField.tap()
        destinationField.typeText("Paris")
        
        measure {
            let suggestionsButton = app.buttons["Get AI Suggestions"]
            suggestionsButton.tap()
            
            let suggestionsView = app.otherElements["AI Suggestions"]
            XCTAssertTrue(suggestionsView.waitForExistence(timeout: 10.0))
        }
    }
}

// MARK: - Accessibility Tests

extension TripCreationFlowTests {
    
    /**
     * Test trip creation accessibility
     */
    func testTripCreationAccessibility() throws {
        navigateToTripCreation()
        
        // Test that all form elements are accessible
        XCTAssertTrue(app.textFields["Destination"].isAccessibilityElement)
        XCTAssertTrue(app.textFields["Start Date"].isAccessibilityElement)
        XCTAssertTrue(app.textFields["End Date"].isAccessibilityElement)
        XCTAssertTrue(app.textFields["Budget"].isAccessibilityElement)
        XCTAssertTrue(app.textFields["Travelers"].isAccessibilityElement)
        XCTAssertTrue(app.textViews["Notes"].isAccessibilityElement)
        XCTAssertTrue(app.buttons["Save Trip"].isAccessibilityElement)
    }
}

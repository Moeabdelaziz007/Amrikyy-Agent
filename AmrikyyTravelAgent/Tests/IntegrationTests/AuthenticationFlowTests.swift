//
//  AuthenticationFlowTests.swift
//  AmrikyyTravelAgentIntegrationTests
//
//  Created by CURSERO AI Agent
//  Copyright © 2025 AMRIKYY AI Solutions. All rights reserved.
//

import XCTest
import SwiftUI
@testable import AmrikyyTravelAgent

/**
 * @class AuthenticationFlowTests
 * @description Integration tests for the complete authentication flow
 * Tests login → home → logout user journey end-to-end
 */
class AuthenticationFlowTests: XCTestCase {
    
    var app: XCUIApplication!
    var authService: AuthService!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
        
        authService = AuthService.shared
    }
    
    override func tearDownWithError() throws {
        app = nil
        authService = nil
    }
    
    // MARK: - Authentication Flow Tests
    
    /**
     * Test complete authentication flow
     * Login → Navigate to Home → Logout
     */
    func testCompleteAuthenticationFlow() throws {
        // Given: App is launched and user is not authenticated
        XCTAssertFalse(authService.isAuthenticated)
        
        // When: User performs login
        performLogin()
        
        // Then: User should be authenticated and see home screen
        XCTAssertTrue(authService.isAuthenticated)
        XCTAssertTrue(app.navigationBars["Home"].exists)
        
        // When: User logs out
        performLogout()
        
        // Then: User should be logged out and see login screen
        XCTAssertFalse(authService.isAuthenticated)
        XCTAssertTrue(app.buttons["Login"].exists)
    }
    
    /**
     * Test guest mode authentication
     */
    func testGuestModeAuthentication() throws {
        // Given: App is launched
        XCTAssertFalse(authService.isAuthenticated)
        
        // When: User selects guest mode
        let guestButton = app.buttons["Continue as Guest"]
        XCTAssertTrue(guestButton.exists)
        guestButton.tap()
        
        // Then: User should be in guest mode
        XCTAssertTrue(authService.isGuestMode)
        XCTAssertTrue(app.navigationBars["Home"].exists)
    }
    
    /**
     * Test authentication persistence
     */
    func testAuthenticationPersistence() throws {
        // Given: User is logged in
        performLogin()
        XCTAssertTrue(authService.isAuthenticated)
        
        // When: App is backgrounded and foregrounded
        XCUIDevice.shared.press(.home)
        app.activate()
        
        // Then: User should still be authenticated
        XCTAssertTrue(authService.isAuthenticated)
        XCTAssertTrue(app.navigationBars["Home"].exists)
    }
    
    /**
     * Test authentication error handling
     */
    func testAuthenticationErrorHandling() throws {
        // Given: Invalid credentials
        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        
        emailField.tap()
        emailField.typeText("invalid@email.com")
        
        passwordField.tap()
        passwordField.typeText("wrongpassword")
        
        // When: User attempts to login
        let loginButton = app.buttons["Login"]
        loginButton.tap()
        
        // Then: Error message should be displayed
        let errorAlert = app.alerts["Authentication Error"]
        XCTAssertTrue(errorAlert.waitForExistence(timeout: 5.0))
        
        // When: User dismisses error
        errorAlert.buttons["OK"].tap()
        
        // Then: User should still be on login screen
        XCTAssertTrue(app.buttons["Login"].exists)
    }
    
    // MARK: - Helper Methods
    
    private func performLogin() {
        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        
        emailField.tap()
        emailField.typeText("test@example.com")
        
        passwordField.tap()
        passwordField.typeText("testpassword")
        
        let loginButton = app.buttons["Login"]
        loginButton.tap()
        
        // Wait for authentication to complete
        let homeNavigationBar = app.navigationBars["Home"]
        XCTAssertTrue(homeNavigationBar.waitForExistence(timeout: 10.0))
    }
    
    private func performLogout() {
        // Navigate to profile tab
        let profileTab = app.tabBars.buttons["Profile"]
        profileTab.tap()
        
        // Tap logout button
        let logoutButton = app.buttons["Logout"]
        XCTAssertTrue(logoutButton.exists)
        logoutButton.tap()
        
        // Confirm logout
        let confirmAlert = app.alerts["Logout"]
        XCTAssertTrue(confirmAlert.waitForExistence(timeout: 5.0))
        confirmAlert.buttons["Logout"].tap()
        
        // Wait for login screen
        let loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 5.0))
    }
}

// MARK: - Performance Tests

extension AuthenticationFlowTests {
    
    /**
     * Test authentication performance
     */
    func testAuthenticationPerformance() throws {
        measure {
            performLogin()
            performLogout()
        }
    }
    
    /**
     * Test app launch performance
     */
    func testAppLaunchPerformance() throws {
        measure {
            app.terminate()
            app.launch()
        }
    }
}

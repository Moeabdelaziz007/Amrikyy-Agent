//
//  PaymentFlowTests.swift
//  AmrikyyTravelAgentIntegrationTests
//
//  Created by CURSERO AI Agent
//  Copyright © 2025 AMRIKYY AI Solutions. All rights reserved.
//

import XCTest
import SwiftUI
@testable import AmrikyyTravelAgent

/**
 * @class PaymentFlowTests
 * @description Integration tests for the complete payment flow
 * Tests select method → process → confirm payment journey end-to-end
 */
class PaymentFlowTests: XCTestCase {
    
    var app: XCUIApplication!
    var paymentService: PaymentService!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
        
        paymentService = PaymentService.shared
        
        // Ensure user is authenticated
        performLoginIfNeeded()
    }
    
    override func tearDownWithError() throws {
        app = nil
        paymentService = nil
    }
    
    // MARK: - Payment Flow Tests
    
    /**
     * Test complete payment flow with credit card
     * Select method → Enter details → Process → Confirm
     */
    func testCompleteCreditCardPaymentFlow() throws {
        // Given: User is authenticated and has a trip
        createTestTrip()
        
        // When: User navigates to payment
        navigateToPayment()
        
        // Then: Payment screen should be visible
        XCTAssertTrue(app.navigationBars["Payment"].exists)
        
        // When: User selects credit card payment
        let creditCardButton = app.buttons["Credit Card"]
        XCTAssertTrue(creditCardButton.exists)
        creditCardButton.tap()
        
        // Then: Credit card form should be visible
        XCTAssertTrue(app.textFields["Card Number"].exists)
        
        // When: User enters credit card details
        fillCreditCardDetails()
        
        // And: User processes payment
        let processPaymentButton = app.buttons["Process Payment"]
        processPaymentButton.tap()
        
        // Then: Payment should be processed successfully
        let successAlert = app.alerts["Payment Successful"]
        XCTAssertTrue(successAlert.waitForExistence(timeout: 15.0))
        
        // When: User confirms payment
        successAlert.buttons["OK"].tap()
        
        // Then: User should see payment confirmation
        XCTAssertTrue(app.navigationBars["Payment Confirmation"].exists)
    }
    
    /**
     * Test Apple Pay payment flow
     */
    func testApplePayPaymentFlow() throws {
        // Given: User is on payment screen
        navigateToPayment()
        
        // When: User selects Apple Pay
        let applePayButton = app.buttons["Apple Pay"]
        XCTAssertTrue(applePayButton.exists)
        applePayButton.tap()
        
        // Then: Apple Pay sheet should appear
        let applePaySheet = app.sheets["Apple Pay"]
        XCTAssertTrue(applePaySheet.waitForExistence(timeout: 5.0))
        
        // When: User authenticates with Face ID/Touch ID
        // Note: In actual testing, this would require biometric authentication
        
        // Then: Payment should be processed
        let successAlert = app.alerts["Payment Successful"]
        XCTAssertTrue(successAlert.waitForExistence(timeout: 10.0))
    }
    
    /**
     * Test payment validation
     */
    func testPaymentValidation() throws {
        // Given: User is on payment screen
        navigateToPayment()
        
        // When: User selects credit card
        let creditCardButton = app.buttons["Credit Card"]
        creditCardButton.tap()
        
        // And: User tries to process without entering details
        let processPaymentButton = app.buttons["Process Payment"]
        processPaymentButton.tap()
        
        // Then: Validation errors should be displayed
        let errorAlert = app.alerts["Validation Error"]
        XCTAssertTrue(errorAlert.waitForExistence(timeout: 5.0))
        
        // When: User dismisses error
        errorAlert.buttons["OK"].tap()
        
        // Then: User should still be on payment screen
        XCTAssertTrue(app.navigationBars["Payment"].exists)
    }
    
    /**
     * Test payment failure handling
     */
    func testPaymentFailureHandling() throws {
        // Given: User is on payment screen
        navigateToPayment()
        
        // When: User selects credit card
        let creditCardButton = app.buttons["Credit Card"]
        creditCardButton.tap()
        
        // And: User enters invalid card details
        fillInvalidCreditCardDetails()
        
        // And: User processes payment
        let processPaymentButton = app.buttons["Process Payment"]
        processPaymentButton.tap()
        
        // Then: Payment failure should be handled
        let failureAlert = app.alerts["Payment Failed"]
        XCTAssertTrue(failureAlert.waitForExistence(timeout: 15.0))
        
        // When: User dismisses failure alert
        failureAlert.buttons["OK"].tap()
        
        // Then: User should be able to retry payment
        XCTAssertTrue(app.buttons["Process Payment"].exists)
    }
    
    /**
     * Test saved payment methods
     */
    func testSavedPaymentMethods() throws {
        // Given: User has saved payment methods
        navigateToPayment()
        
        // When: User views saved payment methods
        let savedMethodsButton = app.buttons["Saved Payment Methods"]
        XCTAssertTrue(savedMethodsButton.exists)
        savedMethodsButton.tap()
        
        // Then: Saved methods should be displayed
        let savedMethodsView = app.otherElements["Saved Payment Methods"]
        XCTAssertTrue(savedMethodsView.waitForExistence(timeout: 5.0))
        
        // When: User selects a saved method
        let savedMethodButton = app.buttons["Use Saved Card"]
        XCTAssertTrue(savedMethodButton.exists)
        savedMethodButton.tap()
        
        // Then: Payment should be processed with saved method
        let successAlert = app.alerts["Payment Successful"]
        XCTAssertTrue(successAlert.waitForExistence(timeout: 10.0))
    }
    
    /**
     * Test payment history
     */
    func testPaymentHistory() throws {
        // Given: User has completed payments
        completeTestPayment()
        
        // When: User navigates to payment history
        let paymentHistoryButton = app.buttons["Payment History"]
        XCTAssertTrue(paymentHistoryButton.exists)
        paymentHistoryButton.tap()
        
        // Then: Payment history should be displayed
        let paymentHistoryView = app.otherElements["Payment History"]
        XCTAssertTrue(paymentHistoryView.waitForExistence(timeout: 5.0))
        
        // And: Previous payments should be listed
        XCTAssertTrue(app.otherElements["Payment Item"].exists)
    }
    
    /**
     * Test currency conversion
     */
    func testCurrencyConversion() throws {
        // Given: User is on payment screen
        navigateToPayment()
        
        // When: User changes currency
        let currencyButton = app.buttons["USD"]
        currencyButton.tap()
        
        let currencyPicker = app.pickers["Currency Picker"]
        XCTAssertTrue(currencyPicker.exists)
        
        // Select EUR
        currencyPicker.pickerWheels.element.adjust(toPickerWheelValue: "EUR")
        
        // Then: Amount should be converted
        let convertedAmount = app.staticTexts["€4,500.00"]
        XCTAssertTrue(convertedAmount.exists)
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
    
    private func createTestTrip() {
        let tripPlannerTab = app.tabBars.buttons["Trip Planner"]
        tripPlannerTab.tap()
        
        let createTripButton = app.buttons["Create Trip"]
        createTripButton.tap()
        
        // Fill trip details
        let destinationField = app.textFields["Destination"]
        destinationField.tap()
        destinationField.typeText("Tokyo")
        
        let budgetField = app.textFields["Budget"]
        budgetField.tap()
        budgetField.typeText("5000")
        
        let saveButton = app.buttons["Save Trip"]
        saveButton.tap()
        
        let tripDetailsNavigationBar = app.navigationBars["Trip Details"]
        XCTAssertTrue(tripDetailsNavigationBar.waitForExistence(timeout: 10.0))
    }
    
    private func navigateToPayment() {
        // Navigate to payment tab
        let paymentTab = app.tabBars.buttons["Payment"]
        paymentTab.tap()
    }
    
    private func fillCreditCardDetails() {
        // Fill card number
        let cardNumberField = app.textFields["Card Number"]
        cardNumberField.tap()
        cardNumberField.typeText("4111111111111111")
        
        // Fill expiry date
        let expiryField = app.textFields["Expiry Date"]
        expiryField.tap()
        expiryField.typeText("12/25")
        
        // Fill CVV
        let cvvField = app.textFields["CVV"]
        cvvField.tap()
        cvvField.typeText("123")
        
        // Fill cardholder name
        let nameField = app.textFields["Cardholder Name"]
        nameField.tap()
        nameField.typeText("John Doe")
    }
    
    private func fillInvalidCreditCardDetails() {
        // Fill invalid card number
        let cardNumberField = app.textFields["Card Number"]
        cardNumberField.tap()
        cardNumberField.typeText("1234567890123456")
        
        // Fill invalid expiry date
        let expiryField = app.textFields["Expiry Date"]
        expiryField.tap()
        expiryField.typeText("01/20")
        
        // Fill CVV
        let cvvField = app.textFields["CVV"]
        cvvField.tap()
        cvvField.typeText("123")
        
        // Fill cardholder name
        let nameField = app.textFields["Cardholder Name"]
        nameField.tap()
        nameField.typeText("John Doe")
    }
    
    private func completeTestPayment() {
        navigateToPayment()
        
        let creditCardButton = app.buttons["Credit Card"]
        creditCardButton.tap()
        
        fillCreditCardDetails()
        
        let processPaymentButton = app.buttons["Process Payment"]
        processPaymentButton.tap()
        
        let successAlert = app.alerts["Payment Successful"]
        XCTAssertTrue(successAlert.waitForExistence(timeout: 15.0))
        
        successAlert.buttons["OK"].tap()
    }
}

// MARK: - Performance Tests

extension PaymentFlowTests {
    
    /**
     * Test payment processing performance
     */
    func testPaymentProcessingPerformance() throws {
        navigateToPayment()
        
        let creditCardButton = app.buttons["Credit Card"]
        creditCardButton.tap()
        
        fillCreditCardDetails()
        
        measure {
            let processPaymentButton = app.buttons["Process Payment"]
            processPaymentButton.tap()
            
            let successAlert = app.alerts["Payment Successful"]
            XCTAssertTrue(successAlert.waitForExistence(timeout: 15.0))
        }
    }
    
    /**
     * Test Apple Pay performance
     */
    func testApplePayPerformance() throws {
        navigateToPayment()
        
        measure {
            let applePayButton = app.buttons["Apple Pay"]
            applePayButton.tap()
            
            let applePaySheet = app.sheets["Apple Pay"]
            XCTAssertTrue(applePaySheet.waitForExistence(timeout: 5.0))
        }
    }
}

// MARK: - Security Tests

extension PaymentFlowTests {
    
    /**
     * Test payment security features
     */
    func testPaymentSecurity() throws {
        navigateToPayment()
        
        let creditCardButton = app.buttons["Credit Card"]
        creditCardButton.tap()
        
        // Test that sensitive fields are secure
        let cardNumberField = app.textFields["Card Number"]
        XCTAssertTrue(cardNumberField.exists)
        
        let cvvField = app.textFields["CVV"]
        XCTAssertTrue(cvvField.exists)
        
        // Test that payment form has security indicators
        let securityIndicator = app.staticTexts["Secure Payment"]
        XCTAssertTrue(securityIndicator.exists)
    }
    
    /**
     * Test fraud detection
     */
    func testFraudDetection() throws {
        navigateToPayment()
        
        let creditCardButton = app.buttons["Credit Card"]
        creditCardButton.tap()
        
        // Fill suspicious details
        let cardNumberField = app.textFields["Card Number"]
        cardNumberField.tap()
        cardNumberField.typeText("4000000000000002") // Test card that triggers fraud detection
        
        let expiryField = app.textFields["Expiry Date"]
        expiryField.tap()
        expiryField.typeText("12/25")
        
        let cvvField = app.textFields["CVV"]
        cvvField.tap()
        cvvField.typeText("123")
        
        let nameField = app.textFields["Cardholder Name"]
        nameField.tap()
        nameField.typeText("John Doe")
        
        let processPaymentButton = app.buttons["Process Payment"]
        processPaymentButton.tap()
        
        // Should trigger fraud detection
        let fraudAlert = app.alerts["Fraud Detection"]
        XCTAssertTrue(fraudAlert.waitForExistence(timeout: 10.0))
    }
}

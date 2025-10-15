import Foundation

class ValidationUtils {
    static let shared = ValidationUtils()

    private init() {}

    func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }

    func isValidPhoneNumber(_ phone: String) -> Bool {
        let phoneRegex = "^[+]?[0-9]{10,15}$"
        let phonePredicate = NSPredicate(format: "SELF MATCHES %@", phoneRegex)
        return phonePredicate.evaluate(with: phone)
    }

    func isValidPassword(_ password: String) -> Bool {
        // At least 8 characters, one uppercase, one lowercase, one number
        let passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$"
        let passwordPredicate = NSPredicate(format: "SELF MATCHES %@", passwordRegex)
        return passwordPredicate.evaluate(with: password)
    }

    func isValidURL(_ urlString: String) -> Bool {
        guard let url = URL(string: urlString) else { return false }
        return url.scheme != nil && url.host != nil
    }

    func isValidName(_ name: String) -> Bool {
        let nameRegex = "^[a-zA-Z\\s]{2,50}$"
        let namePredicate = NSPredicate(format: "SELF MATCHES %@", nameRegex)
        return namePredicate.evaluate(with: name.trimmingCharacters(in: .whitespacesAndNewlines))
    }

    func isValidBudget(_ budget: Double) -> Bool {
        return budget >= 0 && budget <= 1000000 // Reasonable budget limits
    }

    func isValidDateRange(startDate: Date, endDate: Date) -> Bool {
        return startDate < endDate && endDate.timeIntervalSince(startDate) <= (365 * 24 * 60 * 60) // Max 1 year
    }
}

extension String {
    func isValidEmail() -> Bool {
        return ValidationUtils.shared.isValidEmail(self)
    }

    func isValidPhoneNumber() -> Bool {
        return ValidationUtils.shared.isValidPhoneNumber(self)
    }

    func isValidPassword() -> Bool {
        return ValidationUtils.shared.isValidPassword(self)
    }

    func isValidURL() -> Bool {
        return ValidationUtils.shared.isValidURL(self)
    }

    func isValidName() -> Bool {
        return ValidationUtils.shared.isValidName(self)
    }
}
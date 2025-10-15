import Foundation

class CurrencyUtils {
    static let shared = CurrencyUtils()

    private init() {}

    func formatCurrency(_ amount: Double, currency: String) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        formatter.locale = Locale.current

        return formatter.string(from: NSNumber(value: amount)) ?? "\(currency) \(amount)"
    }

    func formatCurrency(_ amount: Double, locale: Locale = .current) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = locale

        return formatter.string(from: NSNumber(value: amount)) ?? "\(amount)"
    }

    func convertCurrency(_ amount: Double, from: String, to: String, rate: Double) -> Double {
        guard from != to else { return amount }
        return amount * rate
    }

    func getCurrencySymbol(_ currency: String) -> String {
        let locale = Locale.current
        return locale.localizedString(forCurrencyCode: currency) ?? currency
    }

    func getPopularCurrencies() -> [String] {
        return ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"]
    }
}

extension Double {
    func formattedCurrency(_ currency: String) -> String {
        return CurrencyUtils.shared.formatCurrency(self, currency: currency)
    }

    func formattedCurrency(locale: Locale = .current) -> String {
        return CurrencyUtils.shared.formatCurrency(self, locale: locale)
    }
}
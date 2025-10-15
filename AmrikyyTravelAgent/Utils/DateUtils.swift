import Foundation

class DateUtils {
    static let shared = DateUtils()

    private init() {}

    func formatDate(_ date: Date, style: DateFormatter.Style = .medium) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = style
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }

    func formatDateTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    func formatRelative(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    func daysBetween(_ startDate: Date, _ endDate: Date) -> Int {
        Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 0
    }

    func isToday(_ date: Date) -> Bool {
        Calendar.current.isDateInToday(date)
    }

    func isYesterday(_ date: Date) -> Bool {
        Calendar.current.isDateInYesterday(date)
    }

    func isTomorrow(_ date: Date) -> Bool {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        return Calendar.current.isDate(date, inSameDayAs: tomorrow)
    }
}

extension Date {
    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    var endOfDay: Date {
        Calendar.current.date(byAdding: DateComponents(day: 1, second: -1), to: startOfDay) ?? self
    }

    var isInToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var isInYesterday: Bool {
        Calendar.current.isDateInYesterday(self)
    }

    var isInTomorrow: Bool {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        return Calendar.current.isDate(tomorrow, inSameDayAs: self)
    }
}
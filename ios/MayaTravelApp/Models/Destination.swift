import Foundation

public struct Destination: Identifiable, Codable, Equatable {
    public let id: UUID
    public var name: String
    public var countryCode: String
    public var latitude: Double
    public var longitude: Double
    public var imageURLs: [URL]
    public var rating: Double?

    public init(
        id: UUID = UUID(),
        name: String,
        countryCode: String,
        latitude: Double,
        longitude: Double,
        imageURLs: [URL] = [],
        rating: Double? = nil
    ) {
        self.id = id
        self.name = name
        self.countryCode = countryCode
        self.latitude = latitude
        self.longitude = longitude
        self.imageURLs = imageURLs
        self.rating = rating
    }
}

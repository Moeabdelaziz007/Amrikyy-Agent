import Foundation

public final class APIClient {
    public static let shared = APIClient()

    public var baseURL: URL
    private let urlSession: URLSession

    public init(baseURL: URL = URL(string: "http://localhost:5000")!, urlSession: URLSession = .shared) {
        self.baseURL = baseURL
        self.urlSession = urlSession
    }

    public func jsonDecoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }

    public func jsonEncoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }

    public func request<T: Decodable>(
        path: String,
        method: String = "GET",
        headers: [String: String] = [:],
        body: Data? = nil
    ) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        headers.forEach { request.addValue($0.value, forHTTPHeaderField: $0.key) }
        if body != nil { request.httpBody = body }
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        if body != nil { request.addValue("application/json", forHTTPHeaderField: "Content-Type") }

        let (data, response) = try await urlSession.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError.httpStatus(code: http.statusCode, data: data)
        }
        do {
            return try jsonDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }
    }
}

public enum APIError: Error, LocalizedError {
    case invalidResponse
    case httpStatus(code: Int, data: Data)
    case decoding(Error)

    public var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid response"
        case .httpStatus(let code, _):
            return "HTTP error: \(code)"
        case .decoding(let error):
            return "Decoding error: \(error.localizedDescription)"
        }
    }
}

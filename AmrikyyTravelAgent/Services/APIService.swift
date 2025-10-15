import Foundation
import Combine

enum HTTPMethod: String {
    case GET, POST, PUT, DELETE, PATCH
}

enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(String)
    case decodingError(DecodingError)
    case noData

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let message):
            return "Server error: \(message)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .noData:
            return "No data received from server"
        }
    }
}

protocol APIServiceProtocol {
import Foundation
import Combine

protocol APIServiceProtocol {
    func request<T: Decodable>(_ endpoint: APIEndpoint) -> AnyPublisher<T, Error>
    func request(_ endpoint: APIEndpoint) -> AnyPublisher<Void, Error>
}

class APIService: APIServiceProtocol {
    static let shared = APIService()

    private let baseURL: String
    private let session: URLSession

    init(baseURL: String = "http://localhost:5000", session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    func request<T: Decodable>(_ endpoint: APIEndpoint) -> AnyPublisher<T, Error> {
        guard let url = buildURL(for: endpoint) else {
            return Fail(error: NetworkError.invalidURL).eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.allHTTPHeaderFields = endpoint.headers

        if let body = endpoint.body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        return session.dataTaskPublisher(for: request)
            .tryMap { data, response in
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw NetworkError.invalidResponse
                }

                guard (200...299).contains(httpResponse.statusCode) else {
                    let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                    throw NetworkError.serverError(errorMessage)
                }

                return data
            }
            .decode(type: T.self, decoder: JSONDecoder())
            .mapError { error in
                if let networkError = error as? NetworkError {
                    return networkError
                }
                if let decodingError = error as? DecodingError {
                    return NetworkError.decodingError(decodingError)
                }
                return error
            }
            .eraseToAnyPublisher()
    }

    func request(_ endpoint: APIEndpoint) -> AnyPublisher<Void, Error> {
        guard let url = buildURL(for: endpoint) else {
            return Fail(error: NetworkError.invalidURL).eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.allHTTPHeaderFields = endpoint.headers

        if let body = endpoint.body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        return session.dataTaskPublisher(for: request)
            .tryMap { _, response in
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw NetworkError.invalidResponse
                }

                guard (200...299).contains(httpResponse.statusCode) else {
                    throw NetworkError.serverError("HTTP \(httpResponse.statusCode)")
                }
            }
            .map { _ in () }
            .mapError { error in
                if let networkError = error as? NetworkError {
                    return networkError
                }
                return error
            }
            .eraseToAnyPublisher()
    }

    private func buildURL(for endpoint: APIEndpoint) -> URL? {
        let fullPath = baseURL + endpoint.path
        return URL(string: fullPath)
    }
}

struct APIEndpoint {
    let path: String
    let method: HTTPMethod
    let headers: [String: String]?
    let body: Data?

    init(path: String, method: HTTPMethod = .GET, headers: [String: String]? = nil, body: Data? = nil) {
        self.path = path
        self.method = method
        self.headers = headers
        self.body = body
    }
}

extension APIEndpoint {
    static func travelPlans(userId: String) -> APIEndpoint {
        return APIEndpoint(path: "/api/travel/plans?userId=\(userId)")
    }

    static func createTravelPlan() -> APIEndpoint {
        return APIEndpoint(path: "/api/travel/plans", method: .POST)
    }

    static func updateTravelPlan(id: String) -> APIEndpoint {
        return APIEndpoint(path: "/api/travel/plans/\(id)", method: .PUT)
    }

    static func deleteTravelPlan(id: String) -> APIEndpoint {
        return APIEndpoint(path: "/api/travel/plans/\(id)", method: .DELETE)
    }

    static func destinations(query: String) -> APIEndpoint {
        return APIEndpoint(path: "/api/travel/destinations?query=\(query)")
    }

    static func destinations(page: Int = 1, limit: Int = 20) -> APIEndpoint {
        return APIEndpoint(path: "/api/travel/destinations?page=\(page)&limit=\(limit)")
    }

    static func destinationsWithQuery(query: String, page: Int = 1, limit: Int = 20) -> APIEndpoint {
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        return APIEndpoint(path: "/api/travel/destinations/search?query=\(encodedQuery)&page=\(page)&limit=\(limit)")
    }

    static func destination(id: String) -> APIEndpoint {
        return APIEndpoint(path: "/api/travel/destinations/\(id)")
    }

    static func chat(planId: String) -> APIEndpoint {
        return APIEndpoint(path: "/api/ai/chat", method: .POST)
    }

    static func chatStream(planId: String) -> APIEndpoint {
        return APIEndpoint(path: "/api/ai/chat/stream?planId=\(planId)")
    }

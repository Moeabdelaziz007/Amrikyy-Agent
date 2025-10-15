import Foundation

/// AI Response model for chat interactions
struct AIResponse: Codable, Identifiable, Hashable {
    let id: String
    var content: String
    var role: ResponseRole
    var model: AIModel
    var timestamp: Date
    var conversationId: String?
    var userId: String?
    
    // Response metadata
    var tokens: TokenUsage?
    var confidence: Double?
    var processingTime: TimeInterval?
    var language: String?
    
    // Response features
    var suggestions: [String]?
    var followUpQuestions: [String]?
    var citations: [Citation]?
    var actions: [SuggestedAction]?
    
    // Response quality metrics
    var relevanceScore: Double?
    var completenessScore: Double?
    var helpfulnessScore: Double?
    
    var displayContent: String {
        content.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    var isEmpty: Bool {
        content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    var wordCount: Int {
        content.components(separatedBy: .whitespacesAndNewlines).filter { !$0.isEmpty }.count
    }
    
    var estimatedReadingTime: TimeInterval {
        Double(wordCount) / 200.0 // Average reading speed: 200 words per minute
    }
    
    enum ResponseRole: String, Codable, CaseIterable {
        case assistant = "assistant"
        case system = "system"
        case tool = "tool"
        
        var displayName: String {
            switch self {
            case .assistant: return "Maya AI"
            case .system: return "System"
            case .tool: return "Tool"
            }
        }
    }
    
    enum AIModel: String, Codable, CaseIterable {
        case gpt4 = "gpt-4"
        case gpt35Turbo = "gpt-3.5-turbo"
        case claude3Opus = "claude-3-opus"
        case claude3Sonnet = "claude-3-sonnet"
        case claude3Haiku = "claude-3-haiku"
        case geminiPro = "gemini-pro"
        case custom = "custom"
        
        var displayName: String {
            switch self {
            case .gpt4: return "GPT-4"
            case .gpt35Turbo: return "GPT-3.5 Turbo"
            case .claude3Opus: return "Claude 3 Opus"
            case .claude3Sonnet: return "Claude 3 Sonnet"
            case .claude3Haiku: return "Claude 3 Haiku"
            case .geminiPro: return "Gemini Pro"
            case .custom: return "Custom Model"
            }
        }
        
        var provider: String {
            switch self {
            case .gpt4, .gpt35Turbo: return "OpenAI"
            case .claude3Opus, .claude3Sonnet, .claude3Haiku: return "Anthropic"
            case .geminiPro: return "Google"
            case .custom: return "Custom"
            }
        }
    }
    
    init(
        id: String = UUID().uuidString,
        content: String,
        role: ResponseRole = .assistant,
        model: AIModel,
        timestamp: Date = Date(),
        conversationId: String? = nil,
        userId: String? = nil,
        tokens: TokenUsage? = nil,
        confidence: Double? = nil,
        processingTime: TimeInterval? = nil,
        language: String? = nil,
        suggestions: [String]? = nil,
        followUpQuestions: [String]? = nil,
        citations: [Citation]? = nil,
        actions: [SuggestedAction]? = nil,
        relevanceScore: Double? = nil,
        completenessScore: Double? = nil,
        helpfulnessScore: Double? = nil
    ) {
        self.id = id
        self.content = content
        self.role = role
        self.model = model
        self.timestamp = timestamp
        self.conversationId = conversationId
        self.userId = userId
        self.tokens = tokens
        self.confidence = confidence
        self.processingTime = processingTime
        self.language = language
        self.suggestions = suggestions
        self.followUpQuestions = followUpQuestions
        self.citations = citations
        self.actions = actions
        self.relevanceScore = relevanceScore
        self.completenessScore = completenessScore
        self.helpfulnessScore = helpfulnessScore
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case content
        case role
        case model
        case timestamp
        case conversationId = "conversation_id"
        case userId = "user_id"
        case tokens
        case confidence
        case processingTime = "processing_time"
        case language
        case suggestions
        case followUpQuestions = "follow_up_questions"
        case citations
        case actions
        case relevanceScore = "relevance_score"
        case completenessScore = "completeness_score"
        case helpfulnessScore = "helpfulness_score"
    }
}

/// Token usage information
struct TokenUsage: Codable, Hashable {
    var prompt: Int
    var completion: Int
    var total: Int
    
    var cost: Double? // Optional cost calculation
    
    init(prompt: Int, completion: Int, total: Int? = nil, cost: Double? = nil) {
        self.prompt = prompt
        self.completion = completion
        self.total = total ?? (prompt + completion)
        self.cost = cost
    }
}

/// Citation for response sources
struct Citation: Codable, Identifiable, Hashable {
    let id: String
    var title: String
    var url: String?
    var source: String
    var accessDate: Date?
    var relevance: Double?
    
    init(
        id: String = UUID().uuidString,
        title: String,
        url: String? = nil,
        source: String,
        accessDate: Date? = nil,
        relevance: Double? = nil
    ) {
        self.id = id
        self.title = title
        self.url = url
        self.source = source
        self.accessDate = accessDate
        self.relevance = relevance
    }
}

/// Suggested actions based on AI response
struct SuggestedAction: Codable, Identifiable, Hashable {
    let id: String
    var title: String
    var description: String?
    var actionType: ActionType
    var parameters: [String: String]?
    var isPrimary: Bool
    
    enum ActionType: String, Codable, CaseIterable {
        case createTrip = "create_trip"
        case bookActivity = "book_activity"
        case getDirections = "get_directions"
        case showWeather = "show_weather"
        case translate = "translate"
        case search = "search"
        case call = "call"
        case navigate = "navigate"
        
        var icon: String {
            switch self {
            case .createTrip: return "plus.circle.fill"
            case .bookActivity: return "calendar.badge.plus"
            case .getDirections: return "map.fill"
            case .showWeather: return "cloud.sun.fill"
            case .translate: return "globe"
            case .search: return "magnifyingglass"
            case .call: return "phone.fill"
            case .navigate: return "location.fill"
            }
        }
    }
    
    init(
        id: String = UUID().uuidString,
        title: String,
        description: String? = nil,
        actionType: ActionType,
        parameters: [String: String]? = nil,
        isPrimary: Bool = false
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.actionType = actionType
        self.parameters = parameters
        self.isPrimary = isPrimary
    }
}

// MARK: - Validation Extensions

extension AIResponse {
    func validate() throws {
        guard !content.isEmpty else {
            throw ValidationError.emptyContent
        }
        
        guard wordCount > 0 else {
            throw ValidationError.invalidContent
        }
        
        if let confidence = confidence {
            guard confidence >= 0.0 && confidence <= 1.0 else {
                throw ValidationError.invalidConfidence
            }
        }
    }
    
    enum ValidationError: LocalizedError {
        case emptyContent
        case invalidContent
        case invalidConfidence
        
        var errorDescription: String? {
            switch self {
            case .emptyContent: return "AI response content cannot be empty"
            case .invalidContent: return "AI response content is invalid"
            case .invalidConfidence: return "Confidence score must be between 0.0 and 1.0"
            }
        }
    }
}

// MARK: - Helper Extensions

extension AIResponse {
    static func mock(content: String = "This is a sample AI response for testing purposes.", model: AIModel = .claude3Sonnet) -> AIResponse {
        AIResponse(
            content: content,
            model: model,
            tokens: TokenUsage(prompt: 150, completion: 200, total: 350),
            confidence: 0.85,
            processingTime: 1.2,
            language: "en",
            suggestions: ["Book a trip", "Get more details"],
            followUpQuestions: ["What specific activities are you interested in?", "What's your budget range?"]
        )
    }
}
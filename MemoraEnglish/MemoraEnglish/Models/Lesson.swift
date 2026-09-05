import Foundation

struct Lesson: Identifiable, Codable {
    let id: Int
    let titleEN: String
    let titleRU: String
    let descriptionEN: String
    let descriptionRU: String
    let vocabulary: [Word]
    let sentences: [Sentence]
    let examSentences: [ExamSentence]
    
    func title(for language: AppLanguage) -> String {
        language == .russian ? titleRU : titleEN
    }
    
    func description(for language: AppLanguage) -> String {
        language == .russian ? descriptionRU : descriptionEN
    }
}

struct Word: Identifiable, Codable, Hashable {
    let id: Int
    let english: String
    let russian: String
    
    func translation(for language: AppLanguage) -> String {
        language == .russian ? russian : english
    }
}

struct Sentence: Identifiable, Codable {
    let id: Int
    let english: String
    let russian: String
    
    func translation(for language: AppLanguage) -> String {
        language == .russian ? russian : english
    }
}

struct ExamSentence: Identifiable, Codable {
    let id: Int
    let sentenceEN: String
    let translationRU: String
    let words: [ExamWord]
}

struct ExamWord: Identifiable, Codable {
    var id: String { correct }
    let correct: String
    let alternatives: [String]
    
    var allOptions: [String] {
        ([correct] + alternatives).shuffled()
    }
}

enum AppLanguage: String, CaseIterable, Codable {
    case english = "en"
    case russian = "ru"
    
    var displayName: String {
        switch self {
        case .english: return "English"
        case .russian: return "Русский"
        }
    }
    
    var speechCode: String {
        switch self {
        case .english: return "en-US"
        case .russian: return "ru-RU"
        }
    }
}

struct LessonProgress: Codable {
    var lessonId: Int
    var wordsLearned: Set<Int>
    var examScore: Int
    var isCompleted: Bool
    
    var progressPercentage: Int {
        guard examScore > 0 else { return 0 }
        return min(100, examScore)
    }
    
    init(lessonId: Int) {
        self.lessonId = lessonId
        self.wordsLearned = []
        self.examScore = 0
        self.isCompleted = false
    }
}

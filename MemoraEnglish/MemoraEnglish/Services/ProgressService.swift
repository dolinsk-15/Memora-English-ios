import Foundation

class ProgressService: ObservableObject {
    static let shared = ProgressService()
    
    @Published var lessonProgress: [Int: LessonProgress] = [:]
    @Published var learnedWords: Set<Int> = []
    
    private let progressKey = "lesson_progress"
    private let wordsKey = "learned_words"
    
    private init() {
        loadProgress()
    }
    
    func loadProgress() {
        if let data = UserDefaults.standard.data(forKey: progressKey),
           let decoded = try? JSONDecoder().decode([Int: LessonProgress].self, from: data) {
            lessonProgress = decoded
        }
        
        if let wordsData = UserDefaults.standard.data(forKey: wordsKey),
           let decoded = try? JSONDecoder().decode(Set<Int>.self, from: wordsData) {
            learnedWords = decoded
        }
    }
    
    func saveProgress() {
        if let encoded = try? JSONEncoder().encode(lessonProgress) {
            UserDefaults.standard.set(encoded, forKey: progressKey)
        }
        
        if let wordsEncoded = try? JSONEncoder().encode(learnedWords) {
            UserDefaults.standard.set(wordsEncoded, forKey: wordsKey)
        }
    }
    
    func getProgress(for lessonId: Int) -> LessonProgress {
        lessonProgress[lessonId] ?? LessonProgress(lessonId: lessonId)
    }
    
    func updateExamScore(lessonId: Int, score: Int) {
        var progress = getProgress(for: lessonId)
        progress.examScore = max(progress.examScore, score)
        progress.isCompleted = score >= 90
        lessonProgress[lessonId] = progress
        saveProgress()
    }
    
    func markWordAsLearned(wordId: Int, lessonId: Int) {
        learnedWords.insert(wordId)
        var progress = getProgress(for: lessonId)
        progress.wordsLearned.insert(wordId)
        lessonProgress[lessonId] = progress
        saveProgress()
    }
    
    func isLessonUnlocked(_ lessonId: Int) -> Bool {
        if lessonId == 1 { return true }
        let previousProgress = getProgress(for: lessonId - 1)
        return previousProgress.examScore >= 90
    }
    
    func getLessonProgressPercentage(_ lessonId: Int) -> Int {
        getProgress(for: lessonId).progressPercentage
    }
}

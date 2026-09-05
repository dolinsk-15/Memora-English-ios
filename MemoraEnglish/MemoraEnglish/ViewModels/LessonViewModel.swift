import Foundation
import SwiftUI

class LessonViewModel: ObservableObject {
    @Published var lessons: [Lesson] = []
    @Published var selectedLesson: Lesson?
    @Published var isLoading = false
    
    private let progressService = ProgressService.shared
    
    init() {
        loadLessons()
    }
    
    func loadLessons() {
        lessons = LessonData.allLessons
    }
    
    func getLesson(id: Int) -> Lesson? {
        lessons.first { $0.id == id }
    }
    
    func isLessonUnlocked(_ lessonId: Int) -> Bool {
        progressService.isLessonUnlocked(lessonId)
    }
    
    func getLessonProgress(_ lessonId: Int) -> Int {
        progressService.getLessonProgressPercentage(lessonId)
    }
    
    func updateExamScore(lessonId: Int, score: Int) {
        progressService.updateExamScore(lessonId: lessonId, score: score)
        objectWillChange.send()
    }
    
    func markWordAsLearned(wordId: Int, lessonId: Int) {
        progressService.markWordAsLearned(wordId: wordId, lessonId: lessonId)
    }
    
    func isLessonCompleted(_ lessonId: Int) -> Bool {
        progressService.getProgress(for: lessonId).isCompleted
    }
    
    func getWordsForReview() -> [Word] {
        let learnedIds = progressService.learnedWords
        var words: [Word] = []
        for lesson in lessons {
            words.append(contentsOf: lesson.vocabulary.filter { learnedIds.contains($0.id) })
        }
        return words.shuffled()
    }
}

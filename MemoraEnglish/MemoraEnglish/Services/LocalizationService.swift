import Foundation
import SwiftUI

class LocalizationService: ObservableObject {
    static let shared = LocalizationService()
    
    @Published var currentLanguage: AppLanguage {
        didSet {
            UserDefaults.standard.set(currentLanguage.rawValue, forKey: "app_language")
        }
    }
    
    private var translations: [String: [String: String]] = [
        "en": [
            "tabs.lessons": "Lessons",
            "tabs.review": "Review",
            "tabs.settings": "Settings",
            "lessons.title": "Lessons",
            "lessons.lesson": "Lesson",
            "lessons.progress": "Progress",
            "lessons.words": "Words",
            "lessons.description": "How to Learn?",
            "lessons.continueLesson": "Continue Lesson",
            "lessons.locked": "Complete previous lesson with 90% to unlock",
            "lessons.completed": "Completed",
            "words.title": "Vocabulary",
            "words.learn": "Learn Words",
            "words.english": "English",
            "words.russian": "Russian",
            "words.tap_to_hear": "Tap to hear pronunciation",
            "words.next": "Next",
            "words.previous": "Previous",
            "words.of": "of",
            "review.title": "Word Review",
            "review.empty": "No words to review yet. Learn some words first!",
            "review.correct": "Correct!",
            "review.incorrect": "Incorrect",
            "review.showAnswer": "Show Answer",
            "exam.title": "Exam",
            "exam.build_sentence": "Build the sentence",
            "exam.correct": "Correct!",
            "exam.incorrect": "Try again",
            "exam.next": "Next",
            "exam.finish": "Finish",
            "exam.score": "Your score",
            "exam.tryAgain": "Try Again",
            "exam.complete": "Complete!",
            "settings.title": "Settings",
            "settings.language": "Interface Language",
            "settings.about": "About",
            "settings.version": "Version 1.0",
            "settings.appName": "Memora English"
        ],
        "ru": [
            "tabs.lessons": "Уроки",
            "tabs.review": "Повтор",
            "tabs.settings": "Настройки",
            "lessons.title": "Уроки",
            "lessons.lesson": "Урок",
            "lessons.progress": "Прогресс",
            "lessons.words": "Слова",
            "lessons.description": "Как учить?",
            "lessons.continueLesson": "Продолжить урок",
            "lessons.locked": "Завершите предыдущий урок на 90% для разблокировки",
            "lessons.completed": "Завершено",
            "words.title": "Словарь",
            "words.learn": "Учить слова",
            "words.english": "Английский",
            "words.russian": "Русский",
            "words.tap_to_hear": "Нажмите, чтобы услышать произношение",
            "words.next": "Далее",
            "words.previous": "Назад",
            "words.of": "из",
            "review.title": "Повторение слов",
            "review.empty": "Пока нет слов для повторения. Сначала выучите несколько слов!",
            "review.correct": "Правильно!",
            "review.incorrect": "Неправильно",
            "review.showAnswer": "Показать ответ",
            "exam.title": "Экзамен",
            "exam.build_sentence": "Составьте предложение",
            "exam.correct": "Правильно!",
            "exam.incorrect": "Попробуйте снова",
            "exam.next": "Далее",
            "exam.finish": "Завершить",
            "exam.score": "Ваш результат",
            "exam.tryAgain": "Попробовать снова",
            "exam.complete": "Завершено!",
            "settings.title": "Настройки",
            "settings.language": "Язык интерфейса",
            "settings.about": "О приложении",
            "settings.version": "Версия 1.0",
            "settings.appName": "Memora English"
        ]
    ]
    
    private init() {
        if let saved = UserDefaults.standard.string(forKey: "app_language"),
           let language = AppLanguage(rawValue: saved) {
            self.currentLanguage = language
        } else {
            let deviceLang = Locale.current.language.languageCode?.identifier ?? "en"
            self.currentLanguage = deviceLang == "ru" ? .russian : .english
        }
    }
    
    func t(_ key: String) -> String {
        translations[currentLanguage.rawValue]?[key] ?? key
    }
    
    func setLanguage(_ language: AppLanguage) {
        currentLanguage = language
    }
}

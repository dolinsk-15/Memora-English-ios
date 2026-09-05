import SwiftUI

@main
struct MemoraEnglishApp: App {
    @StateObject private var localization = LocalizationService.shared
    @StateObject private var lessonViewModel = LessonViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(localization)
                .environmentObject(lessonViewModel)
                .preferredColorScheme(.dark)
        }
    }
}

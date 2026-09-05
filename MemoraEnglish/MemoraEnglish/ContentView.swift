import SwiftUI

struct ContentView: View {
    @EnvironmentObject var localization: LocalizationService
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            LessonListView()
                .tabItem {
                    Label(localization.t("tabs.lessons"), systemImage: "book.fill")
                }
                .tag(0)
            
            WordReviewView()
                .tabItem {
                    Label(localization.t("tabs.review"), systemImage: "arrow.triangle.2.circlepath")
                }
                .tag(1)
            
            SettingsView()
                .tabItem {
                    Label(localization.t("tabs.settings"), systemImage: "gearshape.fill")
                }
                .tag(2)
        }
        .tint(.blue)
    }
}

#Preview {
    ContentView()
        .environmentObject(LocalizationService.shared)
        .environmentObject(LessonViewModel())
        .preferredColorScheme(.dark)
}

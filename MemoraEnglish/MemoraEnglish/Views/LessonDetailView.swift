import SwiftUI

struct LessonDetailView: View {
    @EnvironmentObject var localization: LocalizationService
    @EnvironmentObject var lessonViewModel: LessonViewModel
    @Environment(\.dismiss) private var dismiss
    
    let lesson: Lesson
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                descriptionSection
                
                NavigationLink(destination: VocabularyView(lesson: lesson)) {
                    ActivityCard(
                        icon: "list.bullet",
                        title: localization.t("lessons.words"),
                        color: .green
                    )
                }
                
                NavigationLink(destination: ExamView(lesson: lesson)) {
                    ActivityCard(
                        icon: "graduationcap.fill",
                        title: localization.t("lessons.continueLesson"),
                        color: .red
                    )
                }
            }
            .padding()
        }
        .background(
            LinearGradient(
                colors: [Color(hex: "581C87"), Color(hex: "111827"), Color(hex: "1F2937")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
        .navigationTitle(lesson.title(for: localization.currentLanguage))
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
    
    var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "info.circle.fill")
                    .foregroundColor(.blue)
                Text(localization.t("lessons.description"))
                    .font(.headline)
                    .foregroundColor(.white)
            }
            
            Text(lesson.description(for: localization.currentLanguage))
                .font(.body)
                .foregroundColor(.gray)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.05))
        )
    }
}

struct ActivityCard: View {
    let icon: String
    let title: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 15) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(color)
                    .frame(width: 42, height: 42)
                
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(.white)
            }
            
            Text(title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.gray)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
    }
}

#Preview {
    NavigationStack {
        LessonDetailView(lesson: LessonData.lesson1)
            .environmentObject(LocalizationService.shared)
            .environmentObject(LessonViewModel())
    }
    .preferredColorScheme(.dark)
}

import SwiftUI

struct LessonListView: View {
    @EnvironmentObject var localization: LocalizationService
    @EnvironmentObject var lessonViewModel: LessonViewModel
    
    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(lessonViewModel.lessons) { lesson in
                        LessonCard(lesson: lesson)
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
            .navigationTitle(localization.t("lessons.title"))
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }
}

struct LessonCard: View {
    @EnvironmentObject var localization: LocalizationService
    @EnvironmentObject var lessonViewModel: LessonViewModel
    
    let lesson: Lesson
    
    var isUnlocked: Bool {
        lessonViewModel.isLessonUnlocked(lesson.id)
    }
    
    var progress: Int {
        lessonViewModel.getLessonProgress(lesson.id)
    }
    
    var isCompleted: Bool {
        progress >= 90
    }
    
    var body: some View {
        NavigationLink(destination: LessonDetailView(lesson: lesson)) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(circleColor)
                        .frame(width: 54, height: 54)
                    
                    if isUnlocked {
                        Text("\(lesson.id)")
                            .font(.system(size: 23, weight: .bold))
                            .foregroundColor(.white)
                    } else {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.gray)
                    }
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(lesson.title(for: localization.currentLanguage))
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(isCompleted ? .green : .white)
                    
                    if !isUnlocked {
                        Text(localization.t("lessons.locked"))
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    ProgressView(value: Double(progress), total: 100)
                        .progressViewStyle(LinearProgressViewStyle(tint: .green))
                        .frame(width: 80)
                    
                    Text("\(progress)%")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            .padding(.vertical, 13)
            .padding(.horizontal, 16)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(isCompleted ? Color.green.opacity(0.5) : Color.clear, lineWidth: 1)
            )
        }
        .disabled(!isUnlocked)
        .opacity(isUnlocked ? 1 : 0.5)
    }
    
    var circleColor: Color {
        if isCompleted {
            return .green
        } else if isUnlocked {
            return Color(hex: "2563EB")
        } else {
            return Color(hex: "374151")
        }
    }
    
    var cardBackground: Color {
        if isCompleted {
            return Color.green.opacity(0.1)
        } else if isUnlocked {
            return Color.blue.opacity(0.1)
        } else {
            return Color(hex: "1F2937").opacity(0.8)
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    LessonListView()
        .environmentObject(LocalizationService.shared)
        .environmentObject(LessonViewModel())
        .preferredColorScheme(.dark)
}

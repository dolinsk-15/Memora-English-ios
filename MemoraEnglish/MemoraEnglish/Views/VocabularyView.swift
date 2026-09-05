import SwiftUI

struct VocabularyView: View {
    @EnvironmentObject var localization: LocalizationService
    @EnvironmentObject var lessonViewModel: LessonViewModel
    @StateObject private var speechService = SpeechService.shared
    
    let lesson: Lesson
    @State private var currentIndex = 0
    @State private var showTranslation = false
    
    var currentWord: Word {
        lesson.vocabulary[currentIndex]
    }
    
    var body: some View {
        VStack(spacing: 0) {
            progressHeader
            
            Spacer()
            
            wordCard
            
            Spacer()
            
            navigationButtons
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color(hex: "581C87"), Color(hex: "111827"), Color(hex: "1F2937")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
        .navigationTitle(localization.t("words.title"))
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
    
    var progressHeader: some View {
        HStack {
            Text("\(currentIndex + 1) \(localization.t("words.of")) \(lesson.vocabulary.count)")
                .font(.subheadline)
                .foregroundColor(.gray)
            
            Spacer()
            
            ProgressView(value: Double(currentIndex + 1), total: Double(lesson.vocabulary.count))
                .progressViewStyle(LinearProgressViewStyle(tint: .green))
                .frame(width: 100)
        }
        .padding(.bottom, 20)
    }
    
    var wordCard: some View {
        VStack(spacing: 24) {
            Button(action: {
                speechService.speakEnglish(currentWord.english)
            }) {
                VStack(spacing: 8) {
                    Text(currentWord.english)
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)
                    
                    HStack(spacing: 4) {
                        Image(systemName: speechService.isSpeaking ? "speaker.wave.3.fill" : "speaker.wave.2.fill")
                            .foregroundColor(.blue)
                        Text(localization.t("words.tap_to_hear"))
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
            }
            
            Divider()
                .background(Color.gray.opacity(0.3))
            
            if showTranslation {
                Text(currentWord.russian)
                    .font(.system(size: 28, weight: .medium))
                    .foregroundColor(.green)
                    .transition(.opacity.combined(with: .scale))
            } else {
                Button(action: {
                    withAnimation(.spring(response: 0.3)) {
                        showTranslation = true
                    }
                }) {
                    Text("?")
                        .font(.system(size: 28, weight: .medium))
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
    }
    
    var navigationButtons: some View {
        HStack(spacing: 20) {
            Button(action: previousWord) {
                HStack {
                    Image(systemName: "chevron.left")
                    Text(localization.t("words.previous"))
                }
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.3))
                )
            }
            .disabled(currentIndex == 0)
            .opacity(currentIndex == 0 ? 0.5 : 1)
            
            Button(action: nextWord) {
                HStack {
                    Text(localization.t("words.next"))
                    Image(systemName: "chevron.right")
                }
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.blue)
                )
            }
            .disabled(currentIndex >= lesson.vocabulary.count - 1)
            .opacity(currentIndex >= lesson.vocabulary.count - 1 ? 0.5 : 1)
        }
        .padding(.top, 20)
    }
    
    func previousWord() {
        guard currentIndex > 0 else { return }
        withAnimation(.spring(response: 0.3)) {
            currentIndex -= 1
            showTranslation = false
        }
    }
    
    func nextWord() {
        guard currentIndex < lesson.vocabulary.count - 1 else { return }
        lessonViewModel.markWordAsLearned(wordId: currentWord.id, lessonId: lesson.id)
        withAnimation(.spring(response: 0.3)) {
            currentIndex += 1
            showTranslation = false
        }
    }
}

#Preview {
    NavigationStack {
        VocabularyView(lesson: LessonData.lesson1)
            .environmentObject(LocalizationService.shared)
            .environmentObject(LessonViewModel())
    }
    .preferredColorScheme(.dark)
}

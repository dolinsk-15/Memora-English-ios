import SwiftUI

struct WordReviewView: View {
    @EnvironmentObject var localization: LocalizationService
    @EnvironmentObject var lessonViewModel: LessonViewModel
    @StateObject private var speechService = SpeechService.shared
    
    @State private var reviewWords: [Word] = []
    @State private var currentIndex = 0
    @State private var userAnswer = ""
    @State private var showResult = false
    @State private var isCorrect = false
    @State private var showAnswer = false
    
    var currentWord: Word? {
        guard currentIndex < reviewWords.count else { return nil }
        return reviewWords[currentIndex]
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                if reviewWords.isEmpty {
                    emptyState
                } else if let word = currentWord {
                    reviewContent(word: word)
                } else {
                    completedState
                }
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
            .navigationTitle(localization.t("review.title"))
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .onAppear {
                loadReviewWords()
            }
        }
    }
    
    var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "book.closed")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text(localization.t("review.empty"))
                .font(.headline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(maxHeight: .infinity)
    }
    
    var completedState: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
            
            Text(localization.t("exam.complete"))
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Button(action: loadReviewWords) {
                Text(localization.t("exam.tryAgain"))
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 14)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.blue)
                    )
            }
        }
        .frame(maxHeight: .infinity)
    }
    
    func reviewContent(word: Word) -> some View {
        VStack(spacing: 24) {
            HStack {
                Text("\(currentIndex + 1) \(localization.t("words.of")) \(reviewWords.count)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                Spacer()
                
                ProgressView(value: Double(currentIndex + 1), total: Double(reviewWords.count))
                    .progressViewStyle(LinearProgressViewStyle(tint: .green))
                    .frame(width: 100)
            }
            
            Spacer()
            
            VStack(spacing: 16) {
                Button(action: {
                    speechService.speakEnglish(word.english)
                }) {
                    VStack(spacing: 8) {
                        Text(word.english)
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(.white)
                        
                        Image(systemName: speechService.isSpeaking ? "speaker.wave.3.fill" : "speaker.wave.2.fill")
                            .foregroundColor(.blue)
                    }
                }
                
                if showResult {
                    VStack(spacing: 8) {
                        Image(systemName: isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(isCorrect ? .green : .red)
                        
                        Text(isCorrect ? localization.t("review.correct") : word.russian)
                            .font(.title2)
                            .foregroundColor(isCorrect ? .green : .orange)
                    }
                    .transition(.scale.combined(with: .opacity))
                } else if showAnswer {
                    Text(word.russian)
                        .font(.title2)
                        .foregroundColor(.orange)
                        .transition(.opacity)
                } else {
                    TextField(localization.t("words.russian"), text: $userAnswer)
                        .textFieldStyle(.plain)
                        .font(.title2)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.white)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.white.opacity(0.1))
                        )
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .onSubmit {
                            checkAnswer()
                        }
                }
            }
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color.white.opacity(0.05))
            )
            
            Spacer()
            
            HStack(spacing: 16) {
                if !showResult && !showAnswer {
                    Button(action: {
                        withAnimation {
                            showAnswer = true
                        }
                    }) {
                        Text(localization.t("review.showAnswer"))
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.gray.opacity(0.3))
                            )
                    }
                    
                    Button(action: checkAnswer) {
                        Text(localization.t("words.next"))
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 32)
                            .padding(.vertical, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.blue)
                            )
                    }
                } else {
                    Button(action: nextWord) {
                        Text(localization.t("words.next"))
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 48)
                            .padding(.vertical, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.blue)
                            )
                    }
                }
            }
        }
    }
    
    func loadReviewWords() {
        reviewWords = lessonViewModel.getWordsForReview()
        currentIndex = 0
        userAnswer = ""
        showResult = false
        showAnswer = false
    }
    
    func checkAnswer() {
        guard let word = currentWord else { return }
        let normalizedAnswer = userAnswer.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        let normalizedCorrect = word.russian.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        
        isCorrect = normalizedAnswer == normalizedCorrect || normalizedCorrect.contains(normalizedAnswer)
        
        withAnimation(.spring(response: 0.3)) {
            showResult = true
        }
    }
    
    func nextWord() {
        withAnimation(.spring(response: 0.3)) {
            currentIndex += 1
            userAnswer = ""
            showResult = false
            showAnswer = false
        }
    }
}

#Preview {
    WordReviewView()
        .environmentObject(LocalizationService.shared)
        .environmentObject(LessonViewModel())
        .preferredColorScheme(.dark)
}

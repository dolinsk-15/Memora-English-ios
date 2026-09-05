import SwiftUI

struct ExamView: View {
    @EnvironmentObject var localization: LocalizationService
    @EnvironmentObject var lessonViewModel: LessonViewModel
    @Environment(\.dismiss) private var dismiss
    
    let lesson: Lesson
    
    @State private var currentIndex = 0
    @State private var selectedWords: [String] = []
    @State private var showResult = false
    @State private var isCorrect = false
    @State private var correctAnswers = 0
    @State private var showFinalScore = false
    
    var currentSentence: ExamSentence? {
        guard currentIndex < lesson.examSentences.count else { return nil }
        return lesson.examSentences[currentIndex]
    }
    
    var totalSentences: Int {
        lesson.examSentences.count
    }
    
    var scorePercentage: Int {
        guard totalSentences > 0 else { return 0 }
        return Int((Double(correctAnswers) / Double(totalSentences)) * 100)
    }
    
    var body: some View {
        VStack(spacing: 0) {
            if showFinalScore {
                finalScoreView
            } else if let sentence = currentSentence {
                examContent(sentence: sentence)
            }
        }
        .background(
            LinearGradient(
                colors: [Color(hex: "581C87"), Color(hex: "111827"), Color(hex: "1F2937")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
        .navigationTitle(localization.t("exam.title"))
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
    
    var finalScoreView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: scorePercentage >= 90 ? "star.fill" : "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(scorePercentage >= 90 ? .yellow : .green)
            
            Text(localization.t("exam.complete"))
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 8) {
                Text(localization.t("exam.score"))
                    .font(.headline)
                    .foregroundColor(.gray)
                
                Text("\(scorePercentage)%")
                    .font(.system(size: 56, weight: .bold))
                    .foregroundColor(scorePercentage >= 90 ? .green : .orange)
            }
            
            if scorePercentage >= 90 {
                Text(localization.t("lessons.completed"))
                    .font(.title3)
                    .foregroundColor(.green)
            }
            
            Spacer()
            
            HStack(spacing: 16) {
                Button(action: restartExam) {
                    Text(localization.t("exam.tryAgain"))
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.gray.opacity(0.3))
                        )
                }
                
                Button(action: {
                    lessonViewModel.updateExamScore(lessonId: lesson.id, score: scorePercentage)
                    dismiss()
                }) {
                    Text(localization.t("exam.finish"))
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
            .padding(.bottom, 32)
        }
        .padding()
    }
    
    func examContent(sentence: ExamSentence) -> some View {
        VStack(spacing: 20) {
            HStack {
                Text("\(currentIndex + 1) \(localization.t("words.of")) \(totalSentences)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                Spacer()
                
                ProgressView(value: Double(currentIndex + 1), total: Double(totalSentences))
                    .progressViewStyle(LinearProgressViewStyle(tint: .green))
                    .frame(width: 100)
            }
            .padding(.horizontal)
            .padding(.top)
            
            VStack(spacing: 8) {
                Text(localization.t("exam.build_sentence"))
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                Text(sentence.translationRU)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
            }
            .padding()
            
            selectedWordsView(sentence: sentence)
            
            if showResult {
                resultView
            }
            
            Spacer()
            
            wordOptionsView(sentence: sentence)
            
            if showResult {
                Button(action: nextSentence) {
                    Text(currentIndex < totalSentences - 1 ? localization.t("exam.next") : localization.t("exam.finish"))
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.blue)
                        )
                }
                .padding(.horizontal)
                .padding(.bottom)
            }
        }
    }
    
    func selectedWordsView(sentence: ExamSentence) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                ForEach(0..<sentence.words.count, id: \.self) { index in
                    if index < selectedWords.count {
                        Button(action: {
                            if !showResult {
                                removeWord(at: index)
                            }
                        }) {
                            Text(selectedWords[index])
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(wordColor(at: index, sentence: sentence))
                                )
                        }
                        .disabled(showResult)
                    } else {
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.gray.opacity(0.5), style: StrokeStyle(lineWidth: 2, dash: [5]))
                            .frame(width: 60, height: 36)
                    }
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white.opacity(0.05))
            )
        }
        .padding(.horizontal)
    }
    
    func wordColor(at index: Int, sentence: ExamSentence) -> Color {
        guard showResult, index < sentence.words.count, index < selectedWords.count else {
            return Color.blue.opacity(0.3)
        }
        return selectedWords[index] == sentence.words[index].correct ? Color.green : Color.red
    }
    
    var resultView: some View {
        HStack(spacing: 8) {
            Image(systemName: isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundColor(isCorrect ? .green : .red)
            
            Text(isCorrect ? localization.t("exam.correct") : localization.t("exam.incorrect"))
                .font(.headline)
                .foregroundColor(isCorrect ? .green : .red)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill((isCorrect ? Color.green : Color.red).opacity(0.1))
        )
        .transition(.scale.combined(with: .opacity))
    }
    
    func wordOptionsView(sentence: ExamSentence) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 12) {
            ForEach(allOptions(for: sentence), id: \.self) { word in
                Button(action: {
                    selectWord(word, sentence: sentence)
                }) {
                    Text(word)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(selectedWords.contains(word) ? Color.gray.opacity(0.3) : Color.blue.opacity(0.3))
                        )
                }
                .disabled(selectedWords.contains(word) || showResult)
                .opacity(selectedWords.contains(word) ? 0.5 : 1)
            }
        }
        .padding(.horizontal)
        .padding(.bottom)
    }
    
    func allOptions(for sentence: ExamSentence) -> [String] {
        var options: [String] = []
        for word in sentence.words {
            options.append(contentsOf: word.allOptions)
        }
        return options.shuffled()
    }
    
    func selectWord(_ word: String, sentence: ExamSentence) {
        guard selectedWords.count < sentence.words.count else { return }
        selectedWords.append(word)
        
        if selectedWords.count == sentence.words.count {
            checkAnswer(sentence: sentence)
        }
    }
    
    func removeWord(at index: Int) {
        guard index < selectedWords.count else { return }
        selectedWords.remove(at: index)
    }
    
    func checkAnswer(sentence: ExamSentence) {
        isCorrect = true
        for (index, word) in sentence.words.enumerated() {
            if index >= selectedWords.count || selectedWords[index] != word.correct {
                isCorrect = false
                break
            }
        }
        
        if isCorrect {
            correctAnswers += 1
        }
        
        withAnimation(.spring(response: 0.3)) {
            showResult = true
        }
    }
    
    func nextSentence() {
        if currentIndex < totalSentences - 1 {
            withAnimation(.spring(response: 0.3)) {
                currentIndex += 1
                selectedWords = []
                showResult = false
            }
        } else {
            withAnimation(.spring(response: 0.3)) {
                showFinalScore = true
            }
        }
    }
    
    func restartExam() {
        withAnimation(.spring(response: 0.3)) {
            currentIndex = 0
            selectedWords = []
            showResult = false
            correctAnswers = 0
            showFinalScore = false
        }
    }
}

#Preview {
    NavigationStack {
        ExamView(lesson: LessonData.lesson1)
            .environmentObject(LocalizationService.shared)
            .environmentObject(LessonViewModel())
    }
    .preferredColorScheme(.dark)
}

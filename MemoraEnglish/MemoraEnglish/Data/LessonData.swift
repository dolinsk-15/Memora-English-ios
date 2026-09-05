import Foundation

struct LessonData {
    static let allLessons: [Lesson] = [
        lesson1,
        lesson2,
        lesson3
    ]
    
    static let lesson1 = Lesson(
        id: 1,
        titleEN: "Lesson 1",
        titleRU: "Урок 1",
        descriptionEN: "In the first lesson, we will learn to conjugate English verbs in three simple tenses: Present, Future, and Past.",
        descriptionRU: "На первом уроке мы научимся спрягать английские глаголы в трёх простых временах: настоящее, будущее, прошедшее.",
        vocabulary: [
            Word(id: 1, english: "I", russian: "я"),
            Word(id: 2, english: "you", russian: "ты / вы"),
            Word(id: 3, english: "he", russian: "он"),
            Word(id: 4, english: "she", russian: "она"),
            Word(id: 5, english: "it", russian: "оно, это"),
            Word(id: 6, english: "we", russian: "мы"),
            Word(id: 7, english: "they", russian: "они"),
            Word(id: 8, english: "answer", russian: "отвечать"),
            Word(id: 9, english: "ask", russian: "спрашивать"),
            Word(id: 10, english: "begin", russian: "начинать"),
            Word(id: 11, english: "bring", russian: "приносить"),
            Word(id: 12, english: "buy", russian: "покупать"),
            Word(id: 13, english: "close", russian: "закрывать"),
            Word(id: 14, english: "come", russian: "приходить"),
            Word(id: 15, english: "drink", russian: "пить"),
            Word(id: 16, english: "eat", russian: "есть, кушать"),
            Word(id: 17, english: "feel", russian: "чувствовать"),
            Word(id: 18, english: "find", russian: "находить"),
            Word(id: 19, english: "finish", russian: "заканчивать"),
            Word(id: 20, english: "fly", russian: "летать"),
            Word(id: 21, english: "forget", russian: "забывать"),
            Word(id: 22, english: "get", russian: "получать"),
            Word(id: 23, english: "give", russian: "давать"),
            Word(id: 24, english: "go", russian: "ходить, идти"),
            Word(id: 25, english: "grow", russian: "расти"),
            Word(id: 26, english: "hear", russian: "слышать"),
            Word(id: 27, english: "help", russian: "помогать"),
            Word(id: 28, english: "know", russian: "знать"),
            Word(id: 29, english: "leave", russian: "оставлять, покидать"),
            Word(id: 30, english: "live", russian: "жить"),
            Word(id: 31, english: "look", russian: "смотреть"),
            Word(id: 32, english: "lose", russian: "терять"),
            Word(id: 33, english: "love", russian: "любить"),
            Word(id: 34, english: "make", russian: "делать, создавать"),
            Word(id: 35, english: "meet", russian: "встречать"),
            Word(id: 36, english: "open", russian: "открывать"),
            Word(id: 37, english: "pay", russian: "платить"),
            Word(id: 38, english: "put", russian: "класть"),
            Word(id: 39, english: "read", russian: "читать"),
            Word(id: 40, english: "run", russian: "бежать"),
            Word(id: 41, english: "say", russian: "говорить, сказать"),
            Word(id: 42, english: "see", russian: "видеть"),
            Word(id: 43, english: "set", russian: "устанавливать"),
            Word(id: 44, english: "show", russian: "показывать"),
            Word(id: 45, english: "sit", russian: "сидеть"),
            Word(id: 46, english: "sleep", russian: "спать"),
            Word(id: 47, english: "speak", russian: "говорить"),
            Word(id: 48, english: "study", russian: "учиться"),
            Word(id: 49, english: "take", russian: "брать"),
            Word(id: 50, english: "tell", russian: "рассказывать")
        ],
        sentences: [
            Sentence(id: 1, english: "Did he drink?", russian: "Он пил?"),
            Sentence(id: 2, english: "I brought.", russian: "Я принёс."),
            Sentence(id: 3, english: "You did not start.", russian: "Ты не начал."),
            Sentence(id: 4, english: "Did they bring?", russian: "Они принесли?"),
            Sentence(id: 5, english: "She lives in Moscow.", russian: "Она живет в Москве."),
            Sentence(id: 6, english: "You do not find.", russian: "Ты не находишь."),
            Sentence(id: 7, english: "They thought.", russian: "Они думали."),
            Sentence(id: 8, english: "I will not hear.", russian: "Я не услышу."),
            Sentence(id: 9, english: "I loved.", russian: "Я любил."),
            Sentence(id: 10, english: "They did not finish.", russian: "Они не закончили.")
        ],
        examSentences: [
            ExamSentence(id: 1, sentenceEN: "Did he drink?", translationRU: "Он пил?", words: [
                ExamWord(correct: "Did", alternatives: ["Do", "Will", "Has"]),
                ExamWord(correct: "he", alternatives: ["she", "they", "we"]),
                ExamWord(correct: "drink", alternatives: ["eat", "make", "see"])
            ]),
            ExamSentence(id: 2, sentenceEN: "I brought.", translationRU: "Я принёс.", words: [
                ExamWord(correct: "I", alternatives: ["He", "She", "They"]),
                ExamWord(correct: "brought", alternatives: ["bring", "bought", "took"])
            ]),
            ExamSentence(id: 3, sentenceEN: "You did not start.", translationRU: "Ты не начал.", words: [
                ExamWord(correct: "You", alternatives: ["I", "We", "They"]),
                ExamWord(correct: "did", alternatives: ["do", "will", "have"]),
                ExamWord(correct: "not", alternatives: ["no", "never", "none"]),
                ExamWord(correct: "start", alternatives: ["finish", "go", "come"])
            ]),
            ExamSentence(id: 4, sentenceEN: "She lives in Moscow.", translationRU: "Она живет в Москве.", words: [
                ExamWord(correct: "She", alternatives: ["He", "I", "We"]),
                ExamWord(correct: "lives", alternatives: ["works", "stays", "goes"]),
                ExamWord(correct: "in", alternatives: ["at", "from", "near"]),
                ExamWord(correct: "Moscow", alternatives: ["London", "Paris", "Berlin"])
            ]),
            ExamSentence(id: 5, sentenceEN: "I will not hear.", translationRU: "Я не услышу.", words: [
                ExamWord(correct: "I", alternatives: ["You", "He", "She"]),
                ExamWord(correct: "will", alternatives: ["do", "did", "have"]),
                ExamWord(correct: "not", alternatives: ["no", "never", "none"]),
                ExamWord(correct: "hear", alternatives: ["see", "find", "know"])
            ])
        ]
    )
    
    static let lesson2 = Lesson(
        id: 2,
        titleEN: "Lesson 2",
        titleRU: "Урок 2",
        descriptionEN: "In the second lesson, we continue learning simple tenses with new vocabulary and practice constructing sentences.",
        descriptionRU: "Во втором уроке мы продолжаем изучение простых времён с новой лексикой и практикуем составление предложений.",
        vocabulary: [
            Word(id: 101, english: "think", russian: "думать"),
            Word(id: 102, english: "travel", russian: "путешествовать"),
            Word(id: 103, english: "turn", russian: "поворачивать"),
            Word(id: 104, english: "understand", russian: "понимать"),
            Word(id: 105, english: "work", russian: "работать"),
            Word(id: 106, english: "write", russian: "писать"),
            Word(id: 107, english: "door", russian: "дверь"),
            Word(id: 108, english: "window", russian: "окно"),
            Word(id: 109, english: "house", russian: "дом"),
            Word(id: 110, english: "room", russian: "комната"),
            Word(id: 111, english: "table", russian: "стол"),
            Word(id: 112, english: "chair", russian: "стул"),
            Word(id: 113, english: "book", russian: "книга"),
            Word(id: 114, english: "pen", russian: "ручка"),
            Word(id: 115, english: "paper", russian: "бумага"),
            Word(id: 116, english: "water", russian: "вода"),
            Word(id: 117, english: "food", russian: "еда"),
            Word(id: 118, english: "time", russian: "время"),
            Word(id: 119, english: "day", russian: "день"),
            Word(id: 120, english: "night", russian: "ночь")
        ],
        sentences: [
            Sentence(id: 101, english: "I think about you.", russian: "Я думаю о тебе."),
            Sentence(id: 102, english: "We will travel tomorrow.", russian: "Мы будем путешествовать завтра."),
            Sentence(id: 103, english: "Turn left here.", russian: "Поверните налево здесь."),
            Sentence(id: 104, english: "Do you understand?", russian: "Ты понимаешь?"),
            Sentence(id: 105, english: "He works every day.", russian: "Он работает каждый день.")
        ],
        examSentences: [
            ExamSentence(id: 101, sentenceEN: "I think about you.", translationRU: "Я думаю о тебе.", words: [
                ExamWord(correct: "I", alternatives: ["He", "She", "We"]),
                ExamWord(correct: "think", alternatives: ["know", "see", "hear"]),
                ExamWord(correct: "about", alternatives: ["for", "with", "from"]),
                ExamWord(correct: "you", alternatives: ["him", "her", "them"])
            ]),
            ExamSentence(id: 102, sentenceEN: "He works every day.", translationRU: "Он работает каждый день.", words: [
                ExamWord(correct: "He", alternatives: ["She", "I", "They"]),
                ExamWord(correct: "works", alternatives: ["plays", "reads", "writes"]),
                ExamWord(correct: "every", alternatives: ["each", "any", "some"]),
                ExamWord(correct: "day", alternatives: ["night", "week", "year"])
            ])
        ]
    )
    
    static let lesson3 = Lesson(
        id: 3,
        titleEN: "Lesson 3",
        titleRU: "Урок 3",
        descriptionEN: "In the third lesson, we learn about family members and basic relationships in English.",
        descriptionRU: "В третьем уроке мы изучаем членов семьи и основные отношения на английском языке.",
        vocabulary: [
            Word(id: 201, english: "family", russian: "семья"),
            Word(id: 202, english: "mother", russian: "мать"),
            Word(id: 203, english: "father", russian: "отец"),
            Word(id: 204, english: "sister", russian: "сестра"),
            Word(id: 205, english: "brother", russian: "брат"),
            Word(id: 206, english: "son", russian: "сын"),
            Word(id: 207, english: "daughter", russian: "дочь"),
            Word(id: 208, english: "grandmother", russian: "бабушка"),
            Word(id: 209, english: "grandfather", russian: "дедушка"),
            Word(id: 210, english: "child", russian: "ребёнок"),
            Word(id: 211, english: "children", russian: "дети"),
            Word(id: 212, english: "parents", russian: "родители"),
            Word(id: 213, english: "friend", russian: "друг"),
            Word(id: 214, english: "husband", russian: "муж"),
            Word(id: 215, english: "wife", russian: "жена")
        ],
        sentences: [
            Sentence(id: 201, english: "This is my family.", russian: "Это моя семья."),
            Sentence(id: 202, english: "My mother is a teacher.", russian: "Моя мать — учитель."),
            Sentence(id: 203, english: "I have two brothers.", russian: "У меня есть два брата."),
            Sentence(id: 204, english: "She loves her children.", russian: "Она любит своих детей."),
            Sentence(id: 205, english: "My grandmother lives with us.", russian: "Моя бабушка живёт с нами.")
        ],
        examSentences: [
            ExamSentence(id: 201, sentenceEN: "This is my family.", translationRU: "Это моя семья.", words: [
                ExamWord(correct: "This", alternatives: ["That", "It", "Here"]),
                ExamWord(correct: "is", alternatives: ["are", "was", "were"]),
                ExamWord(correct: "my", alternatives: ["his", "her", "their"]),
                ExamWord(correct: "family", alternatives: ["friend", "house", "work"])
            ]),
            ExamSentence(id: 202, sentenceEN: "I have two brothers.", translationRU: "У меня есть два брата.", words: [
                ExamWord(correct: "I", alternatives: ["We", "She", "He"]),
                ExamWord(correct: "have", alternatives: ["has", "had", "having"]),
                ExamWord(correct: "two", alternatives: ["one", "three", "four"]),
                ExamWord(correct: "brothers", alternatives: ["sisters", "friends", "children"])
            ])
        ]
    )
}

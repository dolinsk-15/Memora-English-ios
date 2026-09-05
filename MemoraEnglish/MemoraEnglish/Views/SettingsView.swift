import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var localization: LocalizationService
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(AppLanguage.allCases, id: \.self) { language in
                        Button(action: {
                            localization.setLanguage(language)
                        }) {
                            HStack {
                                Text(language.displayName)
                                    .foregroundColor(.white)
                                
                                Spacer()
                                
                                if localization.currentLanguage == language {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                } header: {
                    Text(localization.t("settings.language"))
                        .foregroundColor(.gray)
                }
                
                Section {
                    HStack {
                        Text(localization.t("settings.appName"))
                            .foregroundColor(.white)
                        Spacer()
                        Text(localization.t("settings.version"))
                            .foregroundColor(.gray)
                    }
                } header: {
                    Text(localization.t("settings.about"))
                        .foregroundColor(.gray)
                }
            }
            .scrollContentBackground(.hidden)
            .background(
                LinearGradient(
                    colors: [Color(hex: "581C87"), Color(hex: "111827"), Color(hex: "1F2937")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
            )
            .navigationTitle(localization.t("settings.title"))
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(LocalizationService.shared)
        .preferredColorScheme(.dark)
}

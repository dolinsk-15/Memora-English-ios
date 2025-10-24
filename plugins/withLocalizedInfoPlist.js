// Minimal Expo config plugin to add localized InfoPlist.strings for iOS permission texts
// Adds NSUserNotificationUsageDescription translations for de/en/es/fr/ru
// Usage: add "./plugins/withLocalizedInfoPlist" to app.json plugins

const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const STRINGS_BY_LANG = {
  de: {
    NSUserNotificationUsageDescription:
      'Wir senden dir Erinnerungen, damit du täglich 3 Minuten Englisch übst.'
  },
  en: {
    NSUserNotificationUsageDescription:
      'We send reminders to help you spend 3 minutes a day on English.'
  },
  es: {
    NSUserNotificationUsageDescription:
      'Enviamos recordatorios para que dediques 3 minutos al inglés cada día.'
  },
  fr: {
    NSUserNotificationUsageDescription:
      "Nous envoyons des rappels pour vous aider à consacrer 3 minutes par jour à l'anglais."
  },
  ru: {
    NSUserNotificationUsageDescription:
      'Мы отправляем напоминания, чтобы вы уделяли 3 минуты в день английскому.'
  },
};

function toStringsFileContent(map) {
  return (
    Object.entries(map)
      .map(([k, v]) => `"${k}" = "${String(v).replace(/"/g, '\\"')}";`)
      .join('\n') + '\n'
  );
}

module.exports = function withLocalizedInfoPlist(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.platformProjectRoot; // ios/
      // Detect xcode project name (folder that ends with .xcodeproj)
      const entries = fs.readdirSync(projectRoot);
      const pbxprojDir = entries.find((e) => e.endsWith('.xcodeproj'));
      if (!pbxprojDir) {
        return cfg; // nothing to do in non-prebuilt env
      }
      const projectName = pbxprojDir.replace(/\.xcodeproj$/, '');
      const iosAppDir = path.join(projectRoot, projectName);

      Object.entries(STRINGS_BY_LANG).forEach(([lang, values]) => {
        const lprojDir = path.join(iosAppDir, `${lang}.lproj`);
        if (!fs.existsSync(lprojDir)) {
          fs.mkdirSync(lprojDir, { recursive: true });
        }
        const filePath = path.join(lprojDir, 'InfoPlist.strings');
        fs.writeFileSync(filePath, toStringsFileContent(values), 'utf8');
      });

      return cfg;
    },
  ]);
};



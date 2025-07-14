# 🔐 Система контроля подписок - Документация

## 📋 Обзор

Оптимизированная система контроля подписок использует Superwall SDK для управления подписками с улучшенной производительностью, безопасностью и отладкой.

## 🏗️ Архитектура

### Основные компоненты:

1. **SuperwallService** (`src/services/SuperwallService.ts`)
   - Управляет взаимодействием с Superwall SDK
   - Обрабатывает изменения статуса подписки
   - Предоставляет fallback механизмы

2. **PremiumContext** (`src/contexts/PremiumContext.tsx`)
   - Глобальное состояние премиум статуса
   - Кэширование в AsyncStorage
   - Callback система для обновлений

3. **LoadingIndicator** (`src/components/LoadingIndicator.tsx`)
   - UI компонент для отображения состояния загрузки

4. **SubscriptionDebugger** (`src/utils/subscriptionDebugger.ts`)
   - Утилиты для отладки системы подписок

## 🔄 Поток данных

```
App Launch → PremiumContext.init() → SuperwallService.initialize() → 
Subscription Status Check → Cache Update → UI Update
```

### Детальный поток:

1. **Инициализация:**
   ```
   PremiumContext → SuperwallService.initialize() → 
   Setup subscriptionStatusEmitter listener → 
   Check initial status → Update cache
   ```

2. **Изменение статуса:**
   ```
   Superwall SDK → subscriptionStatusEmitter → 
   handleSubscriptionStatusChange() → 
   Update cache → Call callback → 
   PremiumContext.update() → UI re-render
   ```

3. **Проверка доступа:**
   ```
   Component → usePremium() → isPro state → 
   Conditional rendering
   ```

## 🛡️ Безопасность

### Принципы:
- ✅ **Всегда доверяем Superwall** - основной источник истины
- ✅ **Кэш как fallback** - только для оффлайн режима
- ✅ **Guards от циклов** - предотвращение бесконечных обновлений
- ✅ **Error boundaries** - graceful обработка ошибок

### Защита от обхода:
- Локальный кэш обновляется только при реальных изменениях от Superwall
- Нет прямого доступа к изменению статуса подписки
- Все изменения проходят через Superwall SDK

## ⚡ Производительность

### Оптимизации:
- **Guards от дублирования** - предотвращение лишних обновлений
- **Debouncing** - защита от быстрых последовательных вызовов
- **Кэширование** - AsyncStorage для быстрого доступа
- **Callback система** - мгновенные обновления UI

### Метрики:
- Время инициализации: < 1 секунды
- Время обновления UI: < 100ms
- Память: минимальное использование

## 🐛 Отладка

### Логирование:
Все компоненты используют структурированное логирование с эмодзи:

```
[SuperwallService] 🚀 Initializing...
[Premium] 🔄 Updating isPro: false → true (reason: SuperwallService callback)
[LessonList] 🎯 handleLessonPress { lessonId: 2, isPro: true, unlocked: true }
```

### Debug утилиты:

```typescript
// Полный отчет о состоянии системы
await SubscriptionDebugger.debugFullStatus();

// Очистка всех данных подписки
await SubscriptionDebugger.clearAllSubscriptionData();

// Симуляция изменения подписки
await SubscriptionDebugger.simulateSubscriptionChange();
```

### Ключевые точки отладки:
1. **SuperwallService.debugStatus()** - статус Superwall SDK
2. **PremiumContext** - состояние премиум контекста
3. **AsyncStorage** - кэшированные значения
4. **Network** - подключение к Superwall серверам

## 🚨 Обработка ошибок

### Типы ошибок:
1. **Superwall SDK ошибки** - проблемы с SDK
2. **Network ошибки** - проблемы с сетью
3. **AsyncStorage ошибки** - проблемы с кэшем
4. **Callback ошибки** - проблемы с обновлением UI

### Стратегии восстановления:
- **Fallback к кэшу** при ошибках Superwall
- **Retry механизмы** для сетевых ошибок
- **Graceful degradation** при критических ошибках

## 📱 Использование в компонентах

### Базовое использование:

```typescript
import { usePremium } from '../contexts/PremiumContext';

const MyComponent = () => {
  const { isPro, isLoading } = usePremium();
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  return (
    <View>
      {isPro ? <PremiumContent /> : <FreeContent />}
    </View>
  );
};
```

### Показ paywall:

```typescript
import SuperwallService from '../services/SuperwallService';

const handleUpgrade = async () => {
  try {
    await SuperwallService.showPaywall('campaign_trigger');
    // Статус автоматически обновится через callback
  } catch (error) {
    console.error('Paywall error:', error);
  }
};
```

## 🔧 Конфигурация

### Environment variables:
```typescript
// iOS
const IOS_API_KEY = "your_ios_api_key";

// Android  
const ANDROID_API_KEY = "your_android_api_key";
```

### Superwall настройки:
```typescript
Superwall.configure({
  apiKey: Platform.OS === "ios" ? IOS_API_KEY : ANDROID_API_KEY,
});
```

## 📊 Мониторинг

### Ключевые метрики:
- Время инициализации
- Частота обновлений статуса
- Количество ошибок
- Процент успешных покупок

### Логи для анализа:
```bash
# Поиск ошибок
grep "❌" logs.txt

# Поиск успешных покупок
grep "✅" logs.txt

# Анализ производительности
grep "⏳" logs.txt
```

## 🚀 Развертывание

### Production checklist:
- [ ] API ключи настроены
- [ ] Error handling протестирован
- [ ] Fallback механизмы работают
- [ ] Логирование настроено
- [ ] Мониторинг активен

### Testing:
```bash
# Тест инициализации
npm run test:subscription

# Тест покупки
npm run test:purchase

# Тест восстановления
npm run test:restore
```

## 📞 Поддержка

При возникновении проблем:

1. **Проверьте логи** - используйте `SubscriptionDebugger.debugFullStatus()`
2. **Очистите кэш** - `SubscriptionDebugger.clearAllSubscriptionData()`
3. **Проверьте сеть** - убедитесь в доступности Superwall серверов
4. **Перезапустите приложение** - для сброса состояния

---

**Версия:** 2.1.7  
**Последнее обновление:** 2024  
**Автор:** Development Team 
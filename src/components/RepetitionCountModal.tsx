import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useTranslation } from '../localization';
import spanishTranslations from '../localization/translations/spanish';
import germanTranslations from '../localization/translations/german';
import russianTranslations from '../localization/translations/russian';
import frenchTranslations from '../localization/translations/french';

interface RepetitionCountModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCount: (count: number) => void;
  targetRepetitions: number;
  itemType: 'word' | 'sentence' | 'text';
}

// Определяем интерфейс для словаря переводов
interface TranslationDictionary {
  [key: string]: string;
}

const germanTranslationsLocal = {
  repetitions: {
    setRepetitionCount: "Wiederholungsanzahl festlegen",
    howManyTimesWord: "Wie oft sollte jedes Wort wiederholt werden?",
    times10: "10 mal",
    times20: "20 mal",
    times30: "30 mal",
    custom: "Benutzerdefiniert",
    cancel: "Abbrechen",
    enterNumber: "Nummer eingeben",
    apply: "Anwenden"
  }
};

const RepetitionCountModal: React.FC<RepetitionCountModalProps> = ({
  visible,
  onClose,
  onSelectCount,
  targetRepetitions,
  itemType
}) => {
  const { t, language } = useTranslation();
  const [customRepetitions, setCustomRepetitions] = useState<string>('');
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
  
  // Добавим логи для отладки
  useEffect(() => {
    if (visible) {
      console.log("Current language object:", language);
      console.log("Language type:", typeof language);
      // Выведем все доступные ключи в объекте переводов
      console.log("Available keys in German translations:", 
        Object.keys(germanTranslations || {}));
      
      if (germanTranslations && germanTranslations.repetitions) {
        console.log("German repetitions keys:", 
          Object.keys(germanTranslations.repetitions));
      } else {
        console.log("German repetitions section not found!");
      }
    }
  }, [visible]);
  
  // Функция для получения перевода с учетом языка
  const getModalTranslation = (key: string): string => {
    // Немецкие переводы
    const deTranslations: TranslationDictionary = {
      'repetitions.setRepetitionCount': 'Wiederholungsanzahl festlegen',
      'repetitions.howManyTimesWord': 'Wie oft sollte jedes Wort wiederholt werden?',
      'repetitions.howManyTimesSentence': 'Wie oft sollte jeder Satz wiederholt werden?',
      'repetitions.howManyTimesText': 'Wie oft sollte jeder Text wiederholt werden?', 
      'repetitions.times10': '10 mal',
      'repetitions.times20': '20 mal',
      'repetitions.times30': '30 mal',
      'repetitions.custom': 'Benutzerdefiniert',
      'repetitions.cancel': 'Abbrechen',
      'repetitions.enterNumber': 'Nummer eingeben',
      'repetitions.apply': 'Anwenden'
    };
    
    // Испанские переводы
    const esTranslations: TranslationDictionary = {
      'repetitions.setRepetitionCount': 'Establecer número de repeticiones',
      'repetitions.howManyTimesWord': '¿Cuántas veces se debe repetir cada palabra?',
      'repetitions.howManyTimesSentence': '¿Cuántas veces se debe repetir cada frase?',
      'repetitions.howManyTimesText': '¿Cuántas veces se debe repetir cada texto?', 
      'repetitions.times10': '10 veces',
      'repetitions.times20': '20 veces',
      'repetitions.times30': '30 veces',
      'repetitions.custom': 'Personalizado',
      'repetitions.cancel': 'Cancelar',
      'repetitions.enterNumber': 'Ingresar número',
      'repetitions.apply': 'Aplicar'
    };
    
    // Используем typeof для более безопасного сравнения
    const currentLanguage = String(language).toLowerCase();
    
    if (currentLanguage.includes('de') || currentLanguage.includes('german')) {
      return deTranslations[key] || key;
    } else if (currentLanguage.includes('es') || currentLanguage.includes('spanish')) {
      return esTranslations[key] || key;
    }
    
    // Для других языков используем стандартный механизм
    return t(key);
  };
  
  // Выбор правильного ключа перевода в зависимости от типа элемента
  const getTypeSpecificTranslation = () => {
    switch (itemType) {
      case 'word':
        return 'repetitions.howManyTimesWord';
      case 'sentence':
        return 'repetitions.howManyTimesSentence';
      case 'text':
        return 'repetitions.howManyTimesText';
      default:
        return 'repetitions.howManyTimes';
    }
  };
  
  const handleCustomRepetitions = () => {
    const value = parseInt(customRepetitions, 10);
    if (isNaN(value) || value <= 0) {
      return;
    }
    onSelectCount(value);
    setIsCustomSelected(false);
    setCustomRepetitions('');
  };
  
  const handleClose = () => {
    setIsCustomSelected(false);
    setCustomRepetitions('');
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getModalTranslation('repetitions.setRepetitionCount')}</Text>
            <Text style={styles.modalSubtitle}>{getModalTranslation(getTypeSpecificTranslation())}</Text>
            
            <View style={styles.repetitionOptions}>
              {[10, 20, 30].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.repetitionOption,
                    targetRepetitions === count && !isCustomSelected && styles.selectedRepetitionOption
                  ]}
                  onPress={() => {
                    setIsCustomSelected(false);
                    onSelectCount(count);
                  }}
                >
                  <Text style={[
                    styles.repetitionOptionText,
                    targetRepetitions === count && !isCustomSelected && styles.selectedRepetitionOptionText
                  ]}>
                    {getModalTranslation(`repetitions.times${count}`)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <View style={[
                styles.customRepetitionContainer,
                isCustomSelected && styles.selectedRepetitionOption
              ]}>
                <TouchableOpacity 
                  style={styles.customRepetitionButton}
                  onPress={() => setIsCustomSelected(true)}
                >
                  <Text style={[
                    styles.repetitionOptionText,
                    isCustomSelected && styles.selectedRepetitionOptionText
                  ]}>
                    {getModalTranslation('repetitions.custom')}
                  </Text>
                </TouchableOpacity>
                
                {isCustomSelected && (
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={styles.customInput}
                      value={customRepetitions}
                      onChangeText={setCustomRepetitions}
                      placeholder={getModalTranslation('repetitions.enterNumber')}
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      autoFocus
                    />
                    <TouchableOpacity 
                      style={styles.customInputButton}
                      onPress={handleCustomRepetitions}
                    >
                      <Text style={styles.customInputButtonText}>{getModalTranslation('repetitions.apply')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>{getModalTranslation('repetitions.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 24,
    textAlign: 'center',
  },
  repetitionOptions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  repetitionOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  selectedRepetitionOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: '#3B82F6',
  },
  repetitionOptionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedRepetitionOptionText: {
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  closeButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  customRepetitionContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    width: '100%',
  },
  customRepetitionButton: {
    alignItems: 'center',
  },
  customInputContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  customInput: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: 'white',
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  customInputButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  customInputButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default RepetitionCountModal; 
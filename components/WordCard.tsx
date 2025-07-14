import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import { speakWord } from '../services/speech';
import { LinearGradient } from 'expo-linear-gradient';

interface WordCardProps {
  word: string;
  translation: string;
}

const WordCard: React.FC<WordCardProps> = ({ word, translation }) => {
  const handleSpeak = () => {
    speakWord(word);
  };

  if (Platform.OS === 'android') {
    return (
      <LinearGradient
        colors={['#3B82F6', '#1F2937']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.containerAndroid}
      >
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{word}</Text>
          <TouchableOpacity onPress={handleSpeak} style={styles.soundButton}>
            <Icon name="volume-up" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.translation}>{translation}</Text>
      </LinearGradient>
    );
  }

  // iOS: keep as is
  return (
    <View style={styles.container}>
      <View style={styles.wordContainer}>
        <Text style={styles.word}>{word}</Text>
        <TouchableOpacity onPress={handleSpeak} style={styles.soundButton}>
          <Icon name="volume-up" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.translation}>{translation}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1e2747',
    borderRadius: 12,
    marginVertical: 8,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  word: {
    fontSize: 24,
    color: '#fff',
  },
  translation: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
  },
  soundButton: {
    padding: 8,
  },
  containerAndroid: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 8,
  },
});

export default WordCard; 
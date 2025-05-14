import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SoundButtonProps {
  word: string;
  onPress: () => void;
}

const SoundButton: React.FC<SoundButtonProps> = ({ word, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Icon name="volume-up" size={24} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginLeft: 10,
  },
});

export default SoundButton; 
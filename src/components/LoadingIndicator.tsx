import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingIndicatorProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
});

export default LoadingIndicator; 
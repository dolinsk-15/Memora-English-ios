import React from 'react';
import { View } from 'react-native';
import { LocalizationProvider } from './src/contexts/LocalizationContext';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { Platform } from 'react-native';
import Superwall from '@superwall/react-native-superwall';

const App = () => {
  React.useEffect(() => {
    // Using the provided public API key
    const apiKey = "pk_7bada5a2e111237e170524320d8090d8a8d3d03a19c4e5d4";
    
    Superwall.configure({
      apiKey: apiKey,
    });
  }, []);

  return (
    <LocalizationProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </LocalizationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
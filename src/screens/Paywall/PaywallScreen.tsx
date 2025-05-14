import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import SuperwallService from '../../services/SuperwallService';

type PaywallScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Paywall'>;

const PaywallScreen = () => {
  const navigation = useNavigation<PaywallScreenNavigationProp>();

  useEffect(() => {
    // Show Superwall paywall immediately when screen loads
    const showPaywall = async () => {
      try {
        const success = await SuperwallService.showPaywall();
        if (success) {
          // Navigate to lesson list on successful purchase
          navigation.navigate('LessonList');
        } else {
          // User closed paywall without purchasing
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error showing paywall:', error);
        navigation.goBack();
      }
    };

    showPaywall();
  }, [navigation]);

  // Show loading indicator while Superwall loads
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaywallScreen; 
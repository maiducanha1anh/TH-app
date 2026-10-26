import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from './src/context/AppDataContext.js';
import { SyncProvider } from './src/context/SyncContext.js';
import AppNavigator from './src/navigation/AppNavigator.js';

/**
 * App.js - Điểm vào chính của ứng dụng
 * Tuân thủ mục 5.1: Chỉ bọc Provider + AppNavigator
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <SyncProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SyncProvider>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

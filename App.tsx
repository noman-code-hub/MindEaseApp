/**
 * MindEase - Mental Health Care App
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet, ToastAndroid } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './frontend/src/navigation/AppNavigator';

function App() {
  useEffect(() => {
    ToastAndroid.show('Start App JS', ToastAndroid.LONG);
    console.log('App started');
    const isHermes = () => !!(globalThis as any).HermesInternal;
    console.log('Is Hermes enabled?', isHermes());
    ToastAndroid.show(`Hermes Enabled: ${isHermes()}`, ToastAndroid.LONG);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;

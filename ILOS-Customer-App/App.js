import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { ApplicationProvider } from './src/contexts/ApplicationContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <ApplicationProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
        <Toast />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
};

export default App;


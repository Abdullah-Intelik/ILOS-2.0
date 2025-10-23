import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreenEnhanced from '../screens/LoginScreenEnhanced';
import HomeScreenEnhanced from '../screens/HomeScreenEnhanced';
import ApplicationDetailScreen from '../screens/ApplicationDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreenEnhanced} />
        <Stack.Screen name="Home" component={HomeScreenEnhanced} />
        <Stack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
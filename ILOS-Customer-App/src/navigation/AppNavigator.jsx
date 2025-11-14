import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductSelectionScreen from '../screens/ProductSelectionScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import ApplicationFormScreen from '../screens/ApplicationFormScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import ApplicationStatusScreen from '../screens/ApplicationStatusScreen';
import DraftsScreen from '../screens/DraftsScreen';

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
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductSelection" component={ProductSelectionScreen} />
        <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
        <Stack.Screen name="ApplicationForm" component={ApplicationFormScreen} />
        <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
        <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
        <Stack.Screen name="Drafts" component={DraftsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;


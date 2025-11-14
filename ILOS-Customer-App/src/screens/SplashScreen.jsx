import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { isLoggedIn } from '../utils/storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Simulate splash delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if user is logged in
      const loggedIn = await isLoggedIn();

      if (loggedIn) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      navigation.replace('Login');
    }
  };

  return (
    <LinearGradient
      colors={['#0F766E', '#14B8A6']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />
      
      <View style={styles.content}>
        <Text style={styles.logo}>🏦</Text>
        <Text style={styles.title}>ILOS</Text>
        <Text style={styles.subtitle}>Customer Portal</Text>
        
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={styles.loader}
        />
        
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    color: '#ffffff',
    opacity: 0.7,
    fontSize: 14,
  },
});

export default SplashScreen;


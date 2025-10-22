import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { APP_CONSTANTS } from '../utils/config';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user is already logged in
      if (global.currentAgent) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[APP_CONSTANTS.PRIMARY_COLOR, APP_CONSTANTS.SECONDARY_COLOR, APP_CONSTANTS.PRIMARY_COLOR]}
      style={styles.container}
    >
      <StatusBar backgroundColor={APP_CONSTANTS.PRIMARY_COLOR} barStyle="light-content" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏦</Text>
        </View>
        
        <Text style={styles.title}>ILOS</Text>
        <Text style={styles.appSubtitle}>Intelligent Loan Origination</Text>
        <Text style={styles.subtitle}>EAMVU Officer Portal</Text>
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
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.95,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});

export default SplashScreen;
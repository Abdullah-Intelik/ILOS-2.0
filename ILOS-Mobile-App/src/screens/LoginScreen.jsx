import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { AGENT_CREDENTIALS } from '../utils/config';

const LoginScreen = ({ navigation }) => {
  // ✅ Autofill credentials for easier testing
  const [username, setUsername] = useState('Ahmad Hassan');
  const [password, setPassword] = useState('001');

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    // Check against agent credentials
    const agent = AGENT_CREDENTIALS.find(cred => 
      cred.name.toLowerCase() === username.toLowerCase() && 
      cred.password === password
    );

    if (agent) {
      // Store agent info for use in the app
      global.currentAgent = agent;
      navigation.replace('Home');
    } else {
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🏦</Text>
      </View>
      
      <Text style={styles.title}>ILOS</Text>
      <Text style={styles.appSubtitle}>Intelligent Loan Origination</Text>
      <Text style={styles.subtitle}>EAMVU Officer Portal</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0F766E', '#14B8A6', '#0F766E']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Agent Name</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoCorrect={false}
              editable={true}
              selectTextOnFocus={true}
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              editable={true}
              selectTextOnFocus={true}
              underlineColorAndroid="transparent"
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.loginAsContainer}>
            <Text style={styles.loginAsText}>Access Level</Text>
            <Text style={styles.roleText}>EAMVU Officer</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 30,
    marginHorizontal: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#0F766E',
    fontSize: 18,
    fontWeight: '600',
  },
  loginAsContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  loginAsText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default LoginScreen;
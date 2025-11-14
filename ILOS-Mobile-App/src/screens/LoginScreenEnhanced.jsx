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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { AGENT_CREDENTIALS } from '../utils/config';

const LoginScreenEnhanced = ({ navigation }) => {
  // ✅ Autofill credentials for easier testing
  const [username, setUsername] = useState('Ahmad Hassan');
  const [password, setPassword] = useState('001');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Required Fields', 'Please enter both username and password');
      return;
    }

    setLoading(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      const agent = AGENT_CREDENTIALS.find(cred => 
        cred.name.toLowerCase() === username.toLowerCase() && 
        cred.password === password
      );

      if (agent) {
        global.currentAgent = agent;
        navigation.replace('Home');
      } else {
        setLoading(false);
        Alert.alert('Invalid Credentials', 'Please check your username and password and try again.');
      }
    }, 800);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#0F766E', '#14B8A6']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0F766E" />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🏦</Text>
            </View>
            <Text style={styles.appName}>ILOS</Text>
            <Text style={styles.appTagline}>Intelligent Loan Origination System</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>EAMVU OFFICER PORTAL</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>👤</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Agent Name</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                  selectTextOnFocus={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  editable={!loading}
                  selectTextOnFocus={true}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#9CA3AF', '#6B7280'] : ['#0F766E', '#14B8A6']}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Help Text */}
            <Text style={styles.helpText}>
              Need help? Contact your administrator
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 ILOS. All rights reserved.</Text>
            <Text style={styles.footerVersion}>v2.0</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputGroup: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  inputIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputIcon: {
    fontSize: 24,
  },
  inputWrapper: {
    flex: 1,
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    padding: 0,
    margin: 0,
  },
  loginButton: {
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  helpText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  footerVersion: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.6,
    fontWeight: '500',
  },
});

export default LoginScreenEnhanced;


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import apiService from '../utils/api';
import { validateCNIC, formatCNIC } from '../utils/validation';
import { saveCustomerData } from '../utils/storage';

const LoginScreen = ({ navigation }) => {
  // ✅ Autofill CNIC for easier testing (Ahmed Khan's CNIC)
  const [cnic, setCnic] = useState('3840393463961');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCnicChange = (text) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    setCnic(cleaned);
    setError('');
  };

  const handleLogin = async () => {
    try {
      setError('');
      
      // Validate CNIC
      const validation = validateCNIC(cnic);
      if (!validation.valid) {
        setError(validation.message);
        return;
      }

      setLoading(true);

      // Call API to verify CNIC
      const response = await apiService.loginWithCNIC(validation.cleanCNIC);

      if (response.success) {
        // Save customer data
        await saveCustomerData(response.customer);

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome, ${response.customer?.name || 'Customer'}!`,
        });

        // Check customer status
        const customerStatus = response.customer?.status;
        const isNTB = customerStatus === 'NTB'; // New to Bank - no CBS account
        
        console.log('👤 Customer Status:', customerStatus);
        console.log('📋 Is NTB (needs CBS account):', isNTB);

        if (isNTB) {
          // NTB customers: Go DIRECTLY to document upload to create CBS account
          console.log('🎯 NTB detected - navigating to document upload');
          
          Toast.show({
            type: 'info',
            text1: 'Profile Setup Required',
            text2: 'Please upload your documents to continue',
            visibilityTime: 3000,
          });
          
          navigation.replace('DocumentUpload', {
            isProfileSetup: true, // Flag: This is for CBS account creation, not application
            productType: null, // No product selected yet
          });
        } else {
          // ETB or RETURNING customers: Go directly to home
          console.log('✅ ETB/RETURNING - navigating to home');
          navigation.replace('Home');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config?.url
      });
      
      setError(err.message || 'Unable to login. Please try again.');
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err.message || 'Please check your CNIC and try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      'Guest Mode',
      'In guest mode, you can explore the app and create drafts, but you need to login to submit applications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            await saveCustomerData({ name: 'Guest', cnic: null, isGuest: true });
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#0F766E', '#14B8A6']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🏦</Text>
            <Text style={styles.title}>ILOS Customer</Text>
            <Text style={styles.subtitle}>Apply for loans and credit cards</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Login with CNIC</Text>
              <Text style={styles.cardSubtitle}>
                Enter your 13-digit CNIC number
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CNIC Number</Text>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  placeholder="3520212345678"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={13}
                  value={cnic}
                  onChangeText={handleCnicChange}
                  editable={!loading}
                />
                {cnic.length > 0 && (
                  <Text style={styles.cnicFormatted}>
                    {formatCNIC(cnic)}
                  </Text>
                )}
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleGuestLogin}
                disabled={loading}
              >
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Why CNIC?</Text>
              <Text style={styles.infoText}>
                ✓ Secure authentication{'\n'}
                ✓ Quick application process{'\n'}
                ✓ View your application history{'\n'}
                ✓ Track application status
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Need help? Contact customer support
              </Text>
              <Text style={styles.footerContact}>
                📞 +92-300-1234567 | 📧 support@ilos.com
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#F44336',
  },
  cnicFormatted: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
  },
  loginButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
  },
  guestButton: {
    borderWidth: 1,
    borderColor: '#0F766E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 22,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 4,
  },
  footerContact: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
});

export default LoginScreen;


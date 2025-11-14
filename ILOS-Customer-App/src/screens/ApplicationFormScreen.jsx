import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useApplication } from '../contexts/ApplicationContext';
import apiService from '../utils/api';
import { validateCNIC, validatePhoneNumber, formatCNIC, formatPhoneNumber, validateRequired, validateAmount } from '../utils/validation';
import { getCustomerData } from '../utils/storage';

const FORM_STEPS = [
  { id: 0, title: 'Personal Info', icon: '👤' },
  { id: 1, title: 'Employment', icon: '💼' },
  { id: 2, title: 'Income & Loan', icon: '💰' },
  { id: 3, title: 'Banking', icon: '🏦' },
  { id: 4, title: 'Review', icon: '✓' },
];

const ApplicationFormScreen = ({ route, navigation }) => {
  const { productType, draftId, ocrData } = route.params || {};
  const { currentApplication, updateCurrentApplication, updateApplicationStep, saveCurrentApplicationAsDraft, loadDraft } = useApplication();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Info
    cnic: '',
    title: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    
    // Employment
    employmentType: '',
    companyName: '',
    designation: '',
    experienceYears: '',
    monthlySalary: '',
    
    // Loan/Income
    requestedAmount: '',
    tenure: '',
    loanPurpose: '',
    monthlyIncome: '',
    
    // Banking
    bankName: '',
    accountNumber: '',
    accountType: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Auto-save every time formData changes (debounced by context)
    if (currentApplication) {
      updateCurrentApplication(formData);
    }
  }, [formData]);

  const loadInitialData = async () => {
    try {
      const customer = await getCustomerData();
      
      // Load draft if provided
      if (draftId) {
        const loaded = await loadDraft(draftId);
        if (loaded && currentApplication) {
          setFormData(currentApplication.data || {});
          setCurrentStep(currentApplication.step || 0);
        }
      } else if (customer?.cnic) {
        // PRIORITY 1: Fetch from CBS database first
        console.log('🔄 Fetching customer details from CBS database...');
        const detailsResponse = await apiService.getCustomerDetails(customer.cnic);
        
        if (detailsResponse.success && detailsResponse.customerDetails) {
          const details = detailsResponse.customerDetails;
          
          console.log('📋 CBS Data Received:', JSON.stringify(details, null, 2));
          
          // Helper function to convert CBS gender codes to form values
          const convertGender = (genderCode) => {
            if (!genderCode) return '';
            const code = genderCode.toUpperCase();
            if (code === 'M' || code === 'MALE') return 'Male';
            if (code === 'F' || code === 'FEMALE') return 'Female';
            return genderCode; // Return as-is if already correct format
          };
          
          // Helper function to convert CBS marital status to form values
          const convertMaritalStatus = (status) => {
            if (!status) return '';
            const statusUpper = status.toUpperCase();
            // Handle CBS abbreviations and variations
            if (statusUpper === 'S' || statusUpper === 'SINGLE') return 'Single';
            if (statusUpper === 'M' || statusUpper === 'MARRIED') return 'Married';
            if (statusUpper === 'D' || statusUpper === 'DIVORCED') return 'Divorced';
            if (statusUpper === 'W' || statusUpper === 'WIDOWED') return 'Widowed';
            return status; // Return as-is if already correct format
          };
          
          // Helper function to filter out placeholder values
          const filterPlaceholder = (value) => {
            if (!value) return '';
            // Filter out known placeholder values
            const placeholders = ['0000000000', '0000-000000', 'noemail@temp.com', 'placeholder'];
            const cleanValue = value.toString().trim();
            if (placeholders.includes(cleanValue) || cleanValue.match(/^0+$/)) {
              return ''; // Return empty string for placeholders
            }
            return cleanValue;
          };
          
          // Start with CBS data
          const finalData = {
            cnic: customer.cnic,
            title: details.title || '',
            firstName: details.first_name || '',
            lastName: details.last_name || '',
            fatherName: details.father_or_husband_name || '',
            motherName: details.mother_maiden_name || '',
            dateOfBirth: details.date_of_birth || '',
            gender: convertGender(details.gender),
            maritalStatus: convertMaritalStatus(details.marital_status),
            mobileNumber: filterPlaceholder(details.mobile), // Filter placeholder values
            email: filterPlaceholder(details.email), // Filter placeholder values
            address: details.address || '',
            city: details.city || '',
            employmentType: details.employment_status || '',
            companyName: details.company_name || '',
            designation: details.designation || '',
            monthlySalary: details.gross_monthly_salary?.toString() || '',
            monthlyIncome: details.net_monthly_income?.toString() || '',
            bankName: details.bank_name || '',
            accountNumber: details.account_number || '',
            branch: details.branch || '',
          };
          
          console.log('📝 Form Data Being Set:', JSON.stringify(finalData, null, 2));
          console.log('🔄 Gender converted:', details.gender, '->', finalData.gender);
          console.log('🔄 Marital Status converted:', details.marital_status, '->', finalData.maritalStatus);
          
          // PRIORITY 2: Fill MISSING fields from OCR data
          if (ocrData) {
            console.log('📄 Supplementing CBS data with OCR for missing fields...');
            
            if (ocrData.cnic) {
              const cnicData = ocrData.cnic;
              if (!finalData.firstName && !finalData.lastName && cnicData.name) {
                const nameParts = cnicData.name.trim().split(' ');
                finalData.firstName = nameParts[0] || '';
                finalData.lastName = nameParts.slice(1).join(' ') || '';
              }
              // Support both 'father name' (with space) AND father_name (underscore)
              if (!finalData.fatherName && (cnicData['father name'] || cnicData.father_name)) {
                finalData.fatherName = cnicData['father name'] || cnicData.father_name;
              }
              // Support 'date of birth' (with space), dob, AND date_of_birth
              if (!finalData.dateOfBirth && (cnicData['date of birth'] || cnicData.dob || cnicData.date_of_birth)) {
                finalData.dateOfBirth = cnicData['date of birth'] || cnicData.dob || cnicData.date_of_birth;
              }
              if (!finalData.address && cnicData.address) finalData.address = cnicData.address;
            }
            
            if (ocrData.salarySlip) {
              const salaryData = ocrData.salarySlip;
              // 🔥 PRIORITY: OCR salary ALWAYS overrides party details (most recent data)
              if (salaryData.salary || salaryData.net_salary) {
                const salaryValue = salaryData.salary || salaryData.net_salary;
                // Remove 'Rs.' prefix, 'PKR' suffix, and any non-numeric characters
                const cleanSalary = salaryValue.toString().replace(/[^\d]/g, '');
                finalData.monthlySalary = cleanSalary;
                console.log(`💰 OCR Salary overrides party data: ${cleanSalary} (from: ${salaryValue})`);
              }
              // Company and designation only if missing (less critical)
              if (!finalData.companyName && salaryData.company_name) {
                finalData.companyName = salaryData.company_name;
              }
              if (!finalData.designation && salaryData.designation) {
                finalData.designation = salaryData.designation;
              }
            }
          }
          
          setFormData(prev => {
            const newData = { ...prev, ...finalData };
            console.log('✅ Final Form State:', JSON.stringify(newData, null, 2));
            return newData;
          });
          
          console.log('✅ Auto-filled from CBS (supplemented with OCR)');
          
          Toast.show({
            type: 'success',
            text1: 'Welcome Back!',
            text2: 'Your details loaded from CBS profile',
            visibilityTime: 3000,
          });
        } else if (ocrData) {
          // FALLBACK: No CBS data, use OCR
          console.log('ℹ️ No CBS data, using OCR as fallback...');
          const prefilledData = { cnic: customer.cnic || '' };
          
          if (ocrData.cnic) {
            const cnicData = ocrData.cnic;
            if (cnicData['identity number'] || cnicData.cnic_number) {
              prefilledData.cnic = cnicData['identity number'] || cnicData.cnic_number;
            }
            if (cnicData.name) {
              const nameParts = cnicData.name.trim().split(' ');
              prefilledData.firstName = nameParts[0] || '';
              prefilledData.lastName = nameParts.slice(1).join(' ') || '';
            }
            if (cnicData['father name'] || cnicData.father_name) {
              prefilledData.fatherName = cnicData['father name'] || cnicData.father_name;
            }
            if (cnicData['date of birth'] || cnicData.dob || cnicData.date_of_birth) {
              prefilledData.dateOfBirth = cnicData['date of birth'] || cnicData.dob || cnicData.date_of_birth;
            }
            if (cnicData.address) {
              prefilledData.address = cnicData.address;
              
              // 🆕 Extract city from address
              const addressLower = cnicData.address.toLowerCase();
              const cities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'hyderabad', 'gujranwala', 'sialkot'];
              for (const city of cities) {
                if (addressLower.includes(city)) {
                  prefilledData.city = city.charAt(0).toUpperCase() + city.slice(1);
                  console.log(`🏙️ City extracted from address: ${prefilledData.city}`);
                  break;
                }
              }
            }
            
            // 🆕 Extract gender from CNIC number (7th digit: even = Female, odd = Male)
            if (prefilledData.cnic) {
              const cnicDigits = prefilledData.cnic.replace(/\D/g, ''); // Remove non-digits
              if (cnicDigits.length === 13) {
                const genderDigit = parseInt(cnicDigits[6]); // 7th digit (0-indexed at position 6)
                prefilledData.gender = genderDigit % 2 === 0 ? 'Female' : 'Male';
                console.log(`👤 Gender extracted from CNIC: ${prefilledData.gender} (digit: ${genderDigit})`);
              }
            }
          }
          
          if (ocrData.salarySlip) {
            const salaryData = ocrData.salarySlip;
            // Support both 'salary' and 'net_salary' fields
            if (salaryData.salary || salaryData.net_salary) {
              const salaryValue = salaryData.salary || salaryData.net_salary;
              // Remove 'Rs.' prefix and any non-numeric characters to get whole number
              const cleanSalary = salaryValue.toString().replace(/[^\d]/g, '');
              prefilledData.monthlySalary = cleanSalary;
            }
            if (salaryData.company_name) prefilledData.companyName = salaryData.company_name;
            if (salaryData.designation) prefilledData.designation = salaryData.designation;
          }
          
          setFormData(prev => ({ ...prev, ...prefilledData }));
          
          Toast.show({
            type: 'success',
            text1: 'Form Auto-filled',
            text2: 'Details filled from uploaded documents',
          });
        } else {
          // New customer - just CNIC
          setFormData(prev => ({ ...prev, cnic: customer.cnic || '' }));
          console.log('ℹ️ New customer - no auto-fill');
        }
      } else if (ocrData) {
        // Edge case: OCR data but no customer CNIC
        console.log('⚠️ OCR data available but no customer CNIC');
        const prefilledData = {};
        
        if (ocrData.cnic) {
          const cnicData = ocrData.cnic;
          if (cnicData['identity number'] || cnicData.cnic_number) {
            prefilledData.cnic = cnicData['identity number'] || cnicData.cnic_number;
          }
          if (cnicData.name) {
            const nameParts = cnicData.name.trim().split(' ');
            prefilledData.firstName = nameParts[0] || '';
            prefilledData.lastName = nameParts.slice(1).join(' ') || '';
          }
          if (cnicData['father name'] || cnicData.father_name) {
            prefilledData.fatherName = cnicData['father name'] || cnicData.father_name;
          }
          if (cnicData['date of birth'] || cnicData.dob || cnicData.date_of_birth) {
            prefilledData.dateOfBirth = cnicData['date of birth'] || cnicData.dob || cnicData.date_of_birth;
          }
          if (cnicData.address) {
            prefilledData.address = cnicData.address;
            
            // 🆕 Extract city from address
            const addressLower = cnicData.address.toLowerCase();
            const cities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'hyderabad', 'gujranwala', 'sialkot'];
            for (const city of cities) {
              if (addressLower.includes(city)) {
                prefilledData.city = city.charAt(0).toUpperCase() + city.slice(1);
                console.log(`🏙️ City extracted from address: ${prefilledData.city}`);
                break;
              }
            }
          }
          
          // 🆕 Extract gender from CNIC number (7th digit: even = Female, odd = Male)
          if (prefilledData.cnic) {
            const cnicDigits = prefilledData.cnic.replace(/\D/g, ''); // Remove non-digits
            if (cnicDigits.length === 13) {
              const genderDigit = parseInt(cnicDigits[6]); // 7th digit (0-indexed at position 6)
              prefilledData.gender = genderDigit % 2 === 0 ? 'Female' : 'Male';
              console.log(`👤 Gender extracted from CNIC: ${prefilledData.gender} (digit: ${genderDigit})`);
            }
          }
        }
        
        if (ocrData.salarySlip) {
          const salaryData = ocrData.salarySlip;
          // Support both 'salary' and 'net_salary' fields
          if (salaryData.salary || salaryData.net_salary) {
            const salaryValue = salaryData.salary || salaryData.net_salary;
            // Remove 'Rs.' prefix and any non-numeric characters to get whole number
            const cleanSalary = salaryValue.toString().replace(/[^\d]/g, '');
            prefilledData.monthlySalary = cleanSalary;
          }
          if (salaryData.company_name) prefilledData.companyName = salaryData.company_name;
          if (salaryData.designation) prefilledData.designation = salaryData.designation;
        }
        
        setFormData(prev => ({ ...prev, ...prefilledData }));
        
        Toast.show({
          type: 'success',
          text1: 'Form Auto-filled',
          text2: 'Details filled from uploaded documents',
        });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Fallback to just CNIC
      const customer = await getCustomerData();
      setFormData(prev => ({
        ...prev,
        cnic: customer?.cnic || '',
      }));
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      // Personal Info validation
      if (!formData.cnic) newErrors.cnic = 'CNIC is required';
      else {
        const cnicValid = validateCNIC(formData.cnic);
        if (!cnicValid.valid) newErrors.cnic = cnicValid.message;
      }
      
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
      else {
        const phoneValid = validatePhoneNumber(formData.mobileNumber);
        if (!phoneValid.valid) newErrors.mobileNumber = phoneValid.message;
      }
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }
    
    if (step === 1) {
      // Employment validation
      if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
      if (!formData.monthlySalary) newErrors.monthlySalary = 'Monthly salary is required';
    }
    
    if (step === 2) {
      // Loan validation
      if (!formData.requestedAmount) newErrors.requestedAmount = 'Requested amount is required';
      if (!formData.loanPurpose) newErrors.loanPurpose = 'Loan purpose is required';
    }
    
    if (step === 3) {
      // Banking validation
      if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < FORM_STEPS.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        updateApplicationStep(nextStep);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields correctly',
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateApplicationStep(prevStep);
    }
  };

  const handleSaveDraft = async () => {
    setAutoSaving(true);
    const success = await saveCurrentApplicationAsDraft();
    setAutoSaving(false);
    
    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Draft Saved',
        text2: 'Your progress has been saved',
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep - 1)) {
      Alert.alert('Error', 'Please complete all required fields before submitting');
      return;
    }

    Alert.alert(
      'Submit Application',
      'Are you sure you want to submit this application? You cannot edit it after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Determine if customer is ETB (existing) or NTB (new)
              const customer = await getCustomerData();
              let isExistingCustomer = false;
              
              if (customer && customer.party_id) {
                // Check if customer has any previous applications
                try {
                  const applicationsResponse = await apiService.getMyApplications();
                  isExistingCustomer = applicationsResponse.applications && applicationsResponse.applications.length > 0;
                  console.log(`📊 Customer Type Determination: ${isExistingCustomer ? 'ETB' : 'NTB'} (${applicationsResponse.applications?.length || 0} previous applications)`);
                } catch (error) {
                  console.warn('Could not fetch applications to determine customer type:', error.message);
                  // Assume ETB if party_id exists but can't fetch applications
                  isExistingCustomer = true;
                }
              }
              
              // Prepare application data based on product type
              const applicationData = {
                ...formData,
                productType: currentApplication?.productType || productType,
                // 📱 IMPORTANT: Identify this as mobile app submission
                source: 'mobile_app',
                submitted_from: 'mobile',
                isMobileApp: true,
                isExistingCustomer: isExistingCustomer, // ✅ ETB/NTB determination
                // Include documents from DocumentUploadScreen (passed via route params)
                documents: route.params?.documents || {}
              };

              // Submit to backend
              const result = await apiService.submitApplication(
                currentApplication?.productType || productType,
                applicationData
              );

              // Handle different response statuses
              if (result.status === 'pending_pb_completion') {
                // Regular loans - awaiting PB completion
                Toast.show({
                  type: 'success',
                  text1: '✅ Application Submitted',
                  text2: 'Our team will review and complete your application shortly',
                  visibilityTime: 5000,
                });
                
                navigation.replace('ApplicationStatus', { 
                  losId: result.losId,
                  isPendingReview: true
                });
                
              } else if (result.status === 'loan_disbursed' || result.status === 'application_completed') {
                // Instant loan - fully completed
                Toast.show({
                  type: 'success',
                  text1: '🎉 Loan Approved & Disbursed!',
                  text2: `Your instant loan (LOS-${result.losId}) has been processed`,
                  visibilityTime: 5000,
                });
                
                navigation.replace('ApplicationStatus', { losId: result.losId });
                
              } else {
                // Default success message
                Toast.show({
                  type: 'success',
                  text1: 'Application Submitted',
                  text2: `Your application (LOS-${result.losId}) has been submitted successfully`,
                });
                
                navigation.replace('ApplicationStatus', { losId: result.losId });
              }
            } catch (error) {
              console.error('Submission error:', error);
              Alert.alert('Submission Failed', error.message || 'Please try again');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {FORM_STEPS.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index <= currentStep && styles.stepCircleActive,
            index < currentStep && styles.stepCircleCompleted,
          ]}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
          </View>
          {index < FORM_STEPS.length - 1 && (
            <View style={[
              styles.stepLine,
              index < currentStep && styles.stepLineActive,
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderPersonalInfoForm = () => (
    <ScrollView style={styles.formContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>CNIC *</Text>
        <TextInput
          style={[styles.input, errors.cnic && styles.inputError]}
          placeholder="3520212345678"
          keyboardType="numeric"
          maxLength={13}
          value={formData.cnic}
          onChangeText={(text) => updateField('cnic', text.replace(/[^0-9]/g, ''))}
        />
        {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
        {formData.cnic && <Text style={styles.helperText}>{formatCNIC(formData.cnic)}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.title}
              onValueChange={(value) => updateField('title', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Mr" value="Mr" />
              <Picker.Item label="Mrs" value="Mrs" />
              <Picker.Item label="Ms" value="Ms" />
            </Picker>
          </View>
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => updateField('gender', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={[styles.input, errors.firstName && styles.inputError]}
          placeholder="Enter first name"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          placeholder="Enter last name"
          value={formData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Father's Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter father's name"
          value={formData.fatherName}
          onChangeText={(text) => updateField('fatherName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={[styles.input, errors.mobileNumber && styles.inputError]}
          placeholder="03001234567"
          keyboardType="phone-pad"
          maxLength={11}
          value={formData.mobileNumber}
          onChangeText={(text) => updateField('mobileNumber', text.replace(/[^0-9]/g, ''))}
        />
        {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
        {formData.mobileNumber && <Text style={styles.helperText}>{formatPhoneNumber(formData.mobileNumber)}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Marital Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.maritalStatus}
            onValueChange={(value) => updateField('maritalStatus', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Single" value="Single" />
            <Picker.Item label="Married" value="Married" />
            <Picker.Item label="Divorced" value="Divorced" />
            <Picker.Item label="Widowed" value="Widowed" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter your address"
          multiline
          numberOfLines={3}
          value={formData.address}
          onChangeText={(text) => updateField('address', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city"
          value={formData.city}
          onChangeText={(text) => updateField('city', text)}
        />
      </View>
    </ScrollView>
  );

  const renderEmploymentForm = () => (
    <ScrollView style={styles.formContent}>
      <Text style={styles.stepTitle}>Employment Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Employment Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.employmentType}
            onValueChange={(value) => updateField('employmentType', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Salaried" value="Salaried" />
            <Picker.Item label="Self Employed" value="Self Employed" />
            <Picker.Item label="Business" value="Business" />
            <Picker.Item label="Retired" value="Retired" />
          </Picker>
        </View>
        {errors.employmentType && <Text style={styles.errorText}>{errors.employmentType}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Company/Business Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter company name"
          value={formData.companyName}
          onChangeText={(text) => updateField('companyName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Designation</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter designation"
          value={formData.designation}
          onChangeText={(text) => updateField('designation', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Experience (Years)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter years of experience"
          keyboardType="numeric"
          value={formData.experienceYears}
          onChangeText={(text) => updateField('experienceYears', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Monthly Salary *</Text>
        <TextInput
          style={[styles.input, errors.monthlySalary && styles.inputError]}
          placeholder="Enter monthly salary"
          keyboardType="numeric"
          value={formData.monthlySalary}
          onChangeText={(text) => updateField('monthlySalary', text)}
        />
        {errors.monthlySalary && <Text style={styles.errorText}>{errors.monthlySalary}</Text>}
      </View>
    </ScrollView>
  );

  const renderLoanForm = () => (
    <ScrollView style={styles.formContent}>
      <Text style={styles.stepTitle}>Loan & Income Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Requested Amount *</Text>
        <TextInput
          style={[styles.input, errors.requestedAmount && styles.inputError]}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={formData.requestedAmount}
          onChangeText={(text) => updateField('requestedAmount', text)}
        />
        {errors.requestedAmount && <Text style={styles.errorText}>{errors.requestedAmount}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Loan Tenure (Months)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.tenure}
            onValueChange={(value) => updateField('tenure', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select tenure" value="" />
            <Picker.Item label="6 Months" value="6" />
            <Picker.Item label="12 Months" value="12" />
            <Picker.Item label="18 Months" value="18" />
            <Picker.Item label="24 Months" value="24" />
            <Picker.Item label="36 Months" value="36" />
            <Picker.Item label="48 Months" value="48" />
            <Picker.Item label="60 Months" value="60" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Loan Purpose *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.loanPurpose}
            onValueChange={(value) => updateField('loanPurpose', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select purpose" value="" />
            <Picker.Item label="Personal Use" value="Personal" />
            <Picker.Item label="Home Renovation" value="HomeRenovation" />
            <Picker.Item label="Medical" value="Medical" />
            <Picker.Item label="Education" value="Education" />
            <Picker.Item label="Business" value="Business" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
        {errors.loanPurpose && <Text style={styles.errorText}>{errors.loanPurpose}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Total Monthly Income</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter total monthly income"
          keyboardType="numeric"
          value={formData.monthlyIncome}
          onChangeText={(text) => updateField('monthlyIncome', text)}
        />
      </View>
    </ScrollView>
  );

  const renderBankingForm = () => (
    <ScrollView style={styles.formContent}>
      <Text style={styles.stepTitle}>Banking Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name *</Text>
        <TextInput
          style={[styles.input, errors.bankName && styles.inputError]}
          placeholder="Enter bank name"
          value={formData.bankName}
          onChangeText={(text) => updateField('bankName', text)}
        />
        {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter account number"
          keyboardType="numeric"
          value={formData.accountNumber}
          onChangeText={(text) => updateField('accountNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.accountType}
            onValueChange={(value) => updateField('accountType', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select account type" value="" />
            <Picker.Item label="Current" value="Current" />
            <Picker.Item label="Savings" value="Savings" />
            <Picker.Item label="PLS Savings" value="PLSSavings" />
          </Picker>
        </View>
      </View>
    </ScrollView>
  );

  const renderReviewForm = () => (
    <ScrollView style={styles.formContent}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Personal Information</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Name:</Text>
          <Text style={styles.reviewValue}>{formData.firstName} {formData.lastName}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>CNIC:</Text>
          <Text style={styles.reviewValue}>{formatCNIC(formData.cnic)}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Mobile:</Text>
          <Text style={styles.reviewValue}>{formatPhoneNumber(formData.mobileNumber)}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Employment</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Type:</Text>
          <Text style={styles.reviewValue}>{formData.employmentType || 'N/A'}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Monthly Salary:</Text>
          <Text style={styles.reviewValue}>PKR {formData.monthlySalary || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Loan Details</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Requested Amount:</Text>
          <Text style={styles.reviewValue}>PKR {formData.requestedAmount || 'N/A'}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Purpose:</Text>
          <Text style={styles.reviewValue}>{formData.loanPurpose || 'N/A'}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Tenure:</Text>
          <Text style={styles.reviewValue}>{formData.tenure ? `${formData.tenure} months` : 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Banking</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Bank:</Text>
          <Text style={styles.reviewValue}>{formData.bankName || 'N/A'}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Account:</Text>
          <Text style={styles.reviewValue}>{formData.accountNumber || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.declarationBox}>
        <Text style={styles.declarationText}>
          📋 I hereby declare that all the information provided is true and accurate to the best of my knowledge.
        </Text>
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoForm();
      case 1:
        return renderEmploymentForm();
      case 2:
        return renderLoanForm();
      case 3:
        return renderBankingForm();
      case 4:
        return renderReviewForm();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0F766E', '#14B8A6']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Alert.alert(
                'Save Draft?',
                'Do you want to save your progress before leaving?',
                [
                  { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Save',
                    onPress: async () => {
                      await handleSaveDraft();
                      navigation.goBack();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{currentApplication?.productType || productType}</Text>
            <Text style={styles.headerSubtitle}>
              Step {currentStep + 1} of {FORM_STEPS.length} - {FORM_STEPS[currentStep].title}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSaveDraft} disabled={autoSaving}>
            {autoSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveIcon}>💾</Text>
            )}
          </TouchableOpacity>
        </View>

        {renderStepIndicator()}
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {renderCurrentStep()}
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevious}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < FORM_STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonTextPrimary}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary, loading && styles.navButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.navButtonTextPrimary}>Submit Application ✓</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  saveIcon: {
    fontSize: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  stepCircleCompleted: {
    backgroundColor: '#ffffff',
  },
  stepIcon: {
    fontSize: 20,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 6,
  },
  reviewSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#666',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  declarationBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  declarationText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0F766E',
    marginHorizontal: 6,
  },
  navButtonPrimary: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  navButtonDisabled: {
    backgroundColor: '#a0a0a0',
    borderColor: '#a0a0a0',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F766E',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ApplicationFormScreen;


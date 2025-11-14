import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import apiService from '../utils/api';
import { PRODUCT_TYPES } from '../utils/config';
import { getCustomerData, saveCustomerData } from '../utils/storage';
import { uploadDocumentToServer, mapProductTypeToLoanType } from '../utils/documentUpload';

const DocumentUploadScreen = ({ route, navigation }) => {
  const { productType, isProfileSetup } = route.params || {};
  
  console.log('📄 Document Upload Mode:', isProfileSetup ? 'Profile Setup' : 'Application');
  
  const [documents, setDocuments] = useState({
    cnic: {
      status: 'pending', // pending, uploading, processing, completed, error
      file: null,
      uri: null,
      ocrData: null,
      error: null,
      validation: null, // validation results
      serverPath: null, // FileZilla server path
      serverUrl: null, // FileZilla document URL
    },
    salarySlip: {
      status: 'pending',
      file: null,
      uri: null,
      ocrData: null,
      error: null,
      validation: null,
      serverPath: null, // FileZilla server path
      serverUrl: null, // FileZilla document URL
    },
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [validationEnabled, setValidationEnabled] = useState(true);

  const [loading, setLoading] = useState(false);

  // Auto-validate when documents are updated (after OCR completes)
  useEffect(() => {
    // Only validate if validation is enabled and at least one document has OCR data
    if (validationEnabled && (documents.cnic.ocrData || documents.salarySlip.ocrData)) {
      console.log('🔄 Documents changed, running validation...');
      validateDocuments();
    } else if (!validationEnabled) {
      // Clear validation errors when validation is disabled
      setValidationErrors([]);
      setDocuments((prev) => ({
        ...prev,
        cnic: { ...prev.cnic, validation: null },
        salarySlip: { ...prev.salarySlip, validation: null },
      }));
    }
  }, [documents.cnic.ocrData, documents.salarySlip.ocrData, validationEnabled]);

  const selectImageSource = (docType) => {
    Alert.alert(
      'Select Image Source',
      'Choose how you want to upload your document',
      [
        {
          text: 'Take Photo',
          onPress: () => handleCameraLaunch(docType),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleGalleryLaunch(docType),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleCameraLaunch = async (docType) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      saveToPhotos: false,
    };

    try {
      const result = await launchCamera(options);
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open camera');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        handleImageSelected(docType, result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleGalleryLaunch = async (docType) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      selectionLimit: 1,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open gallery');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        handleImageSelected(docType, result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleImageSelected = async (docType, asset) => {
    console.log('📸 Image selected for', docType, asset);

    // Update UI to show image
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        uri: asset.uri,
        file: asset,
        status: 'uploading',
        error: null,
      },
    }));

    try {
      // Upload and process document
      await uploadAndProcessDocument(docType, asset);
    } catch (error) {
      console.error(`Error processing ${docType}:`, error);
      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'error',
          error: error.message || 'Failed to process document',
        },
      }));
    }
  };

  const uploadAndProcessDocument = async (docType, asset) => {
    try {
      console.log(`🔄 Uploading ${docType}...`);

      // Update status to processing
      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'processing',
        },
      }));

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `${docType}.jpg`,
      });

      // Run OCR based on document type using Backend V2.0 proxy
      let ocrData = null;
      const backendUrl = 'http://localhost:5000'; // Use backend as OCR proxy
      
      if (docType === 'cnic') {
        console.log('🔍 Running CNIC OCR via Backend V2.0...');
        const ocrUrl = `${backendUrl}/api/v1/ocr/cnic`;
        const ocrResponse = await fetch(ocrUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!ocrResponse.ok) {
          throw new Error(`OCR failed: ${ocrResponse.status}`);
        }

        const ocrJson = await ocrResponse.json();
        console.log('🔍 RAW CNIC OCR Response:', JSON.stringify(ocrJson, null, 2));
        
        // NEW OCR structure: {total_files, results: [{result: {...}}]}
        if (ocrJson.results && ocrJson.results[0]?.result) {
          ocrData = ocrJson.results[0].result;
        } else {
          ocrData = ocrJson?.data ?? ocrJson; // Fallback for old structure
        }
        
        console.log('✅ CNIC OCR extracted data:', JSON.stringify(ocrData, null, 2));

      } else if (docType === 'salarySlip') {
        console.log('🔍 Running Salary Slip OCR via Backend V2.0...');
        const ocrUrl = `${backendUrl}/api/v1/ocr/salary`;
        const ocrResponse = await fetch(ocrUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!ocrResponse.ok) {
          throw new Error(`OCR failed: ${ocrResponse.status}`);
        }

        const ocrJson2 = await ocrResponse.json();
        console.log('🔍 RAW Salary Slip OCR Response:', JSON.stringify(ocrJson2, null, 2));
        
        // NEW OCR structure: {total_files, results: [{result: {cnic, salary}}]}
        if (ocrJson2.results && ocrJson2.results[0]?.result) {
          ocrData = ocrJson2.results[0].result;
        } else {
          ocrData = ocrJson2?.data ?? ocrJson2; // Fallback for old structure
        }
        
        console.log('✅ Salary Slip OCR extracted data:', JSON.stringify(ocrData, null, 2));
      }

      // 📤 Upload document to FileZilla server (port 8086)
      console.log('📤 Uploading document to FileZilla server...');
      const customerData = await getCustomerData();
      const customerCnic = customerData?.cnic || 'unknown';
      const loanType = mapProductTypeToLoanType(productType || 'CashPlus');
      
      let serverUploadResult = null;
      try {
        serverUploadResult = await uploadDocumentToServer({
          docType: docType,
          imageUri: asset.uri,
          loanType: loanType,
          losId: `temp-${customerCnic}`, // Temporary folder by CNIC, will be moved to los-{id} when application is created
          cnic: customerCnic,
          ocrData: ocrData,
        });
        console.log(`✅ Document uploaded to server: temp-${customerCnic}/${serverUploadResult.fileName}`);
      } catch (uploadError) {
        console.error('⚠️ Server upload failed (non-blocking):', uploadError.message);
        // Don't throw - Server upload failure shouldn't block OCR flow
      }

      // Update status to completed with both OCR data and server paths
      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'completed',
          ocrData: ocrData,
          serverPath: serverUploadResult?.filePath || null,
          serverUrl: serverUploadResult?.url || null,
        },
      }));

      Toast.show({
        type: 'success',
        text1: 'Document Processed',
        text2: `${docType === 'cnic' ? 'CNIC' : 'Salary Slip'} has been successfully processed`,
      });

      // Validation will run automatically via useEffect

    } catch (error) {
      console.error(`❌ Error uploading ${docType}:`, error);
      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'error',
          error: error.message || 'Failed to process document',
        },
      }));

      Toast.show({
        type: 'error',
        text1: 'Processing Failed',
        text2: error.message || 'Failed to process document',
      });
    }
  };

  const validateDocuments = async () => {
    // Skip validation if disabled
    if (!validationEnabled) {
      console.log('⏭️ Validation disabled, skipping...');
      return;
    }

    try {
      console.log('🔍 Validating documents...');
      
      // Get customer data to validate against
      const customer = await getCustomerData();
      if (!customer || !customer.cnic) {
        console.log('⚠️ No customer data found for validation');
        return;
      }

      console.log('📋 Customer CNIC:', customer.cnic);
      console.log('📋 Documents state:', {
        cnicStatus: documents.cnic.status,
        cnicHasData: !!documents.cnic.ocrData,
        salaryStatus: documents.salarySlip.status,
        salaryHasData: !!documents.salarySlip.ocrData,
      });

      const errors = [];
      const cleanCustomerCnic = customer.cnic.replace(/[-\s]/g, '');

      // Validate CNIC document
      if (documents.cnic.ocrData) {
        const cnicData = documents.cnic.ocrData;
        console.log('🔍 CNIC OCR Data Fields:', Object.keys(cnicData));
        console.log('🔍 Full CNIC OCR Data:', cnicData);
        
        // Handle field names with spaces OR underscores
        const ocrCnic = (cnicData['identity number'] || cnicData.identity_number || cnicData.cnic_number || cnicData.cnic || '').replace(/[-\s]/g, '');
        
        console.log('🔍 CNIC Validation:', {
          customerCnic: cleanCustomerCnic,
          ocrCnic: ocrCnic,
          'identity number': cnicData['identity number'],
          identity_number: cnicData.identity_number,
          cnic_number: cnicData.cnic_number,
          cnic: cnicData.cnic,
          match: ocrCnic === cleanCustomerCnic,
        });

        if (!ocrCnic) {
          errors.push({
            document: 'CNIC',
            field: 'CNIC Number',
            expected: cleanCustomerCnic,
            actual: 'Not extracted',
            message: 'Could not extract CNIC from document',
          });
        } else if (ocrCnic !== cleanCustomerCnic) {
          errors.push({
            document: 'CNIC',
            field: 'CNIC Number',
            expected: cleanCustomerCnic,
            actual: ocrCnic,
            message: 'CNIC does not match logged-in customer',
          });
        }

        // Store validation result
        const cnicValidationStatus = ocrCnic && ocrCnic === cleanCustomerCnic ? 'pass' : 'fail';
        console.log('💾 Setting CNIC validation status:', cnicValidationStatus);
        setDocuments((prev) => ({
          ...prev,
          cnic: {
            ...prev.cnic,
            validation: {
              status: cnicValidationStatus,
              errors: cnicValidationStatus === 'pass' ? [] : ['CNIC mismatch'],
            },
          },
        }));
      }

      // Validate Salary Slip document
      if (documents.salarySlip.ocrData) {
        const salaryData = documents.salarySlip.ocrData;
        // Match web version: cnic OR cnic_number
        const salaryCnic = (salaryData.cnic || salaryData.cnic_number || '').replace(/[-\s]/g, '');
        
        console.log('🔍 Salary Slip Validation:', {
          customerCnic: cleanCustomerCnic,
          salaryCnic: salaryCnic,
          match: salaryCnic === cleanCustomerCnic,
        });

        if (salaryCnic && salaryCnic !== cleanCustomerCnic) {
          errors.push({
            document: 'Salary Slip',
            field: 'CNIC Number',
            expected: cleanCustomerCnic,
            actual: salaryCnic,
            message: 'Salary slip CNIC does not match logged-in customer',
          });
        }

        // Store validation result
        const salaryValidationStatus = salaryCnic && salaryCnic === cleanCustomerCnic ? 'pass' : 'fail';
        console.log('💾 Setting Salary Slip validation status:', salaryValidationStatus);
        setDocuments((prev) => ({
          ...prev,
          salarySlip: {
            ...prev.salarySlip,
            validation: {
              status: salaryValidationStatus,
              errors: salaryValidationStatus === 'pass' ? [] : ['CNIC mismatch'],
            },
          },
        }));
      }

      console.log('📊 Total validation errors:', errors.length);
      console.log('📊 Errors array:', JSON.stringify(errors, null, 2));
      
      setValidationErrors(errors);

      if (errors.length > 0) {
        console.log('❌ Validation failed with', errors.length, 'errors');
        // Don't show alert popup - just display red banner
      } else {
        console.log('✅ Validation passed - no errors found');
      }
    } catch (error) {
      console.error('❌ Validation error:', error);
    }
  };

  const retryUpload = (docType) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        status: 'pending',
        error: null,
        validation: null,
      },
    }));
    setValidationErrors([]);
  };

  const handleContinue = async () => {
    // Check if required documents are uploaded
    if (documents.cnic.status !== 'completed') {
      Alert.alert('Required Document', 'Please upload your CNIC to continue');
      return;
    }

    // Check validation status (ONLY if validation is enabled)
    if (validationEnabled) {
      // Block if ANY validation errors exist
      if (validationErrors.length > 0) {
        Alert.alert(
          'Validation Failed',
          'Your documents do not match your profile. Please upload documents that belong to you, or disable validation to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Block if ANY document has fail status
      if (documents.cnic.validation?.status === 'fail' || 
          (documents.salarySlip.status === 'completed' && documents.salarySlip.validation?.status === 'fail')) {
        Alert.alert(
          'Validation Failed',
          'Document validation failed. Please upload your own documents that match your login credentials, or disable validation to continue.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    // Create CBS customer account for NTB customers (OCR data → CBS database)
    try {
      const customer = await getCustomerData();
      if (customer && customer.cnic) {
        console.log('✅ Party record exists in Backend V2.0 - no CBS creation needed');
        
        // Just refresh customer data to ensure we have the latest
        console.log('🔄 Re-fetching customer data from Backend V2.0...');
        try {
          const loginResponse = await apiService.loginWithCNIC(customer.cnic);
          if (loginResponse.success) {
            await saveCustomerData(loginResponse.customer);
            console.log('✅ Customer data refreshed:', loginResponse.customer.name);
          }
        } catch (refreshError) {
          console.warn('⚠️ Could not refresh customer data (non-critical):', refreshError);
        }
      }
    } catch (error) {
      console.error('❌ Error in document upload flow (non-critical):', error);
      // Don't block the user
    }

    // Navigate based on mode
    if (isProfileSetup) {
      // Profile setup mode: Navigate to Home after CBS account creation
      console.log('✅ Profile setup complete, navigating to Home');
      Toast.show({
        type: 'success',
        text1: 'Profile Created!',
        text2: 'You can now start applying for loans',
        visibilityTime: 3000,
      });
      navigation.replace('Home');
    } else {
      // Application mode: Navigate to application form with OCR data AND documents
      navigation.navigate('ApplicationForm', {
        productType,
        ocrData: {
          cnic: documents.cnic.ocrData,
          salarySlip: documents.salarySlip.ocrData,
        },
        // 📱 Pass documents for backend submission
        documents: {
          cnic: {
            uri: documents.cnic.uri,
            ocrData: documents.cnic.ocrData,
            uploaded: documents.cnic.uploaded,
            serverPath: documents.cnic.serverPath, // FileZilla path
            serverUrl: documents.cnic.serverUrl, // Document URL
          },
          salarySlip: {
            uri: documents.salarySlip.uri,
            ocrData: documents.salarySlip.ocrData,
            uploaded: documents.salarySlip.uploaded,
            serverPath: documents.salarySlip.serverPath, // FileZilla path
            serverUrl: documents.salarySlip.serverUrl, // Document URL
          }
        }
      });
    }
  };

  const handleSkipSalarySlip = () => {
    Alert.alert(
      'Skip Salary Slip',
      'You can upload this document later. Continue without salary slip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: handleContinue,
        },
      ]
    );
  };

  const renderDocumentCard = (docType, title, required = false) => {
    const doc = documents[docType];
    const statusColor = {
      pending: '#9CA3AF',
      uploading: '#3B82F6',
      processing: '#8B5CF6',
      completed: '#10B981',
      error: '#EF4444',
    }[doc.status];

    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentTitleRow}>
            <Text style={styles.documentTitle}>{title}</Text>
            {required && <Text style={styles.requiredBadge}>Required</Text>}
          </View>
          {doc.status === 'completed' && (
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
          )}
        </View>

        {doc.status === 'pending' && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectImageSource(docType)}
          >
            <Text style={styles.uploadIcon}>📤</Text>
            <Text style={styles.uploadButtonText}>Tap to upload {title}</Text>
            <Text style={styles.uploadSubtext}>Take photo or choose from gallery</Text>
          </TouchableOpacity>
        )}

        {(doc.status === 'uploading' || doc.status === 'processing') && (
          <View style={styles.processingContainer}>
            {doc.uri && (
              <Image source={{ uri: doc.uri }} style={styles.previewImage} />
            )}
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.processingText}>
                {doc.status === 'uploading' ? 'Uploading...' : 'Processing with OCR...'}
              </Text>
            </View>
          </View>
        )}

        {doc.status === 'completed' && (
          <View style={styles.completedContainer}>
            <Image source={{ uri: doc.uri }} style={styles.previewImage} />
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeText}>✓ Verified</Text>
            </View>
            {doc.ocrData && (
              <View style={[
                styles.ocrDataContainer,
                doc.validation?.status === 'fail' && styles.ocrDataContainerError
              ]}>
                <Text style={[
                  styles.ocrDataTitle,
                  doc.validation?.status === 'fail' && styles.ocrDataTitleError
                ]}>
                  Extracted Data:
                </Text>
                
                {docType === 'cnic' && (
                  <>
                    <Text style={styles.ocrDataText}>
                      CNIC: {doc.ocrData['identity number'] || doc.ocrData.identity_number || doc.ocrData.cnic_number || doc.ocrData.cnic || 'Not detected'}
                    </Text>
                    <Text style={styles.ocrDataText}>
                      Name: {doc.ocrData.name || 'Not detected'}
                    </Text>
                    {(doc.ocrData['father name'] || doc.ocrData.father_name) && (
                      <Text style={styles.ocrDataText}>
                        Father: {doc.ocrData['father name'] || doc.ocrData.father_name}
                      </Text>
                    )}
                    {(doc.ocrData['date of birth'] || doc.ocrData.dob || doc.ocrData.date_of_birth) && (
                      <Text style={styles.ocrDataText}>
                        DOB: {doc.ocrData['date of birth'] || doc.ocrData.dob || doc.ocrData.date_of_birth}
                      </Text>
                    )}
                    {doc.ocrData.address && (
                      <Text style={styles.ocrDataText}>
                        Address: {doc.ocrData.address}
                      </Text>
                    )}
                  </>
                )}
                
                {docType === 'salarySlip' && (
                  <>
                    <Text style={styles.ocrDataText}>
                      CNIC: {doc.ocrData.cnic || doc.ocrData.cnic_number || 'Not detected'}
                    </Text>
                    <Text style={styles.ocrDataText}>
                      Net Salary: Rs. {doc.ocrData.net_salary || doc.ocrData.salary || 'Not detected'}
                    </Text>
                    {doc.ocrData.company_name && (
                      <Text style={styles.ocrDataText}>
                        Company: {doc.ocrData.company_name}
                      </Text>
                    )}
                    {doc.ocrData.month && (
                      <Text style={styles.ocrDataText}>
                        Month: {doc.ocrData.month}
                      </Text>
                    )}
                  </>
                )}

                {/* Validation Status */}
                {doc.validation && (
                  <View style={styles.validationContainer}>
                    <Text style={[
                      styles.validationText,
                      doc.validation.status === 'pass' ? styles.validationPass : styles.validationFail
                    ]}>
                      {doc.validation.status === 'pass' 
                        ? '✓ Document matches your profile' 
                        : '⚠️ Document does not match your profile'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {doc.status === 'error' && doc.error && (
          <View style={styles.errorContainer}>
            {doc.uri && (
              <Image source={{ uri: doc.uri }} style={styles.previewImage} />
            )}
            <View style={styles.errorBadge}>
              <Text style={styles.errorBadgeText}>❌ Failed</Text>
              <Text style={styles.errorMessage}>{doc.error}</Text>
            </View>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => retryUpload(docType)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {doc.status === 'error' && !doc.error && (
          <View style={styles.errorContainer}>
            <View style={styles.errorBadge}>
              <Text style={styles.errorBadgeText}>❌ Failed</Text>
              <Text style={styles.errorMessage}>Failed to process document. Please try again.</Text>
            </View>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => retryUpload(docType)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const productColor = PRODUCT_TYPES[productType]?.color || '#0F766E';
  const canContinue = documents.cnic.status === 'completed';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[productColor, '#14B8A6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // If in profile setup mode, go back to Login
            // Otherwise, go back to previous screen
            if (isProfileSetup) {
              navigation.replace('Login');
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isProfileSetup ? 'Profile Setup' : 'Upload Documents'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isProfileSetup 
              ? 'Create your bank profile for auto-fill' 
              : (PRODUCT_TYPES[productType]?.label || productType)}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Validation Toggle */}
        <View style={styles.validationToggleCard}>
          <View style={styles.validationToggleRow}>
            <View style={styles.validationToggleInfo}>
              <Text style={styles.validationToggleTitle}>
                🔒 Document Validation
              </Text>
              <Text style={styles.validationToggleSubtitle}>
                {validationEnabled ? 'Documents must match your profile' : 'Validation bypassed (testing mode)'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.validationToggle, validationEnabled && styles.validationToggleOn]}
              onPress={() => setValidationEnabled(!validationEnabled)}
            >
              <View style={[styles.validationToggleThumb, validationEnabled && styles.validationToggleThumbOn]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Validation Error Banner */}
        {validationEnabled && validationErrors.length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerIcon}>⚠️</Text>
            <View style={styles.errorBannerContent}>
              <Text style={styles.errorBannerTitle}>Document Mismatch</Text>
              <Text style={styles.errorBannerText}>
                {validationErrors.map((e) => `${e.document}: ${e.message}`).join('\n')}
              </Text>
              <Text style={styles.errorBannerHint}>
                Please upload documents that belong to you.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Quick Document Verification</Text>
            <Text style={styles.infoText}>
              Upload your documents now to auto-fill your application form. We'll use OCR technology to extract information automatically.
            </Text>
          </View>
        </View>

        {renderDocumentCard('cnic', 'CNIC (Front & Back)', true)}
        {renderDocumentCard('salarySlip', 'Salary Slip (Latest)', false)}

        <View style={styles.actionButtons}>
          {documents.salarySlip.status === 'pending' && canContinue && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipSalarySlip}
            >
              <Text style={styles.skipButtonText}>Skip Salary Slip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={styles.continueButtonText}>
              {canContinue ? 'Continue to Application →' : 'Upload CNIC to Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  validationToggleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  validationToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validationToggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  validationToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  validationToggleSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  validationToggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  validationToggleOn: {
    backgroundColor: '#10B981',
  },
  validationToggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  validationToggleThumbOn: {
    alignSelf: 'flex-end',
  },
  errorBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 2,
    borderWidth: 3,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorBannerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  errorBannerContent: {
    flex: 1,
  },
  errorBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorBannerText: {
    fontSize: 15,
    color: '#991B1B',
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '500',
  },
  errorBannerHint: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  successIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  processingContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  completedContainer: {
    position: 'relative',
  },
  successBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  successBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  ocrDataContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  ocrDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  ocrDataText: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 4,
  },
  ocrDataContainerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  ocrDataTitleError: {
    color: '#991B1B',
  },
  validationContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  validationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  validationPass: {
    color: '#166534',
  },
  validationFail: {
    color: '#991B1B',
  },
  errorContainer: {
    position: 'relative',
  },
  errorBadge: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#DC2626',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 24,
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#0F766E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default DocumentUploadScreen;


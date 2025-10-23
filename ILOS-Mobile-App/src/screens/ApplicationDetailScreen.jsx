import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../utils/api';
import { transformApplicationDetails } from '../utils/dataTransformer';
import { API_CONFIG, APP_CONSTANTS } from '../utils/config';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Linking } from 'react-native';
import { 
  requestLocationPermission, 
  getCurrentLocation, 
  formatLocation,
  showLocationConfirmation 
} from '../utils/location';

// Fallback icon component for when MaterialIcons fail to load
const FallbackIcon = ({ name, size, color, style }) => {
  const iconMap = {
    'play-arrow': '▶',
    'phone': '📞',
    'check-circle': '✓',
    'assignment': '📋',
    'person': '👤',
    'location-on': '📍',
    'work': '💼',
    'account-balance': '💰',
    'people': '👥',
    'arrow-back': '←',
    'more-vert': '⋮',
    'close': '✕',
    'lock': '🔒',
    'logout': '🚪',
    'chevron-right': '›',
    'map': '🗺️',
    'error': '❌',
  };

  const icon = iconMap[name] || '•';
  
  return (
    <Text style={[
      { 
        fontSize: size * 0.8, // Slightly smaller for better visual balance
        color,
        textAlign: 'center',
        lineHeight: size,
      }, 
      style
    ]}>
      {icon}
    </Text>
  );
};

// Enhanced icon component with fallback
const AppIcon = ({ name, size, color, style }) => {
  // For now, always use fallback icons since MaterialIcons fonts aren't properly linked
  return <FallbackIcon name={name} size={size} color={color} style={style} />;
};

const ApplicationDetailScreen = ({ route, navigation }) => {
  const { application } = route.params;
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitModalVisible, setVisitModalVisible] = useState(false);
  const [visitStatus, setVisitStatus] = useState('pending'); // pending, in-progress, completed
  const [comments, setComments] = useState({
    verification: '',
    employment: '',
    neighborhood: '',
    observations: '',
  });
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
    requestAndSetLocation();
  }, []);

  // Load documents when applicationDetails is available
  useEffect(() => {
    if (applicationDetails) {
      loadDocuments();
    }
  }, [applicationDetails]);

  // Request location permission and get current location
  const requestAndSetLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        setLocationLoading(true);
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        console.log('📍 Location captured:', location);
      }
    } catch (error) {
      console.error('📍 Failed to get location:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Load documents for this application
  const loadDocuments = async () => {
    try {
      // Get applicationType from application or applicationDetails
      const appType = applicationDetails?.application_type || 
                      applicationDetails?.applicationType || 
                      application?.applicationType || 
                      'cashplus'; // Default fallback
      
      const documents = await apiService.getApplicationDocuments(application.losId, appType);
      setUploadedDocuments(documents || []);
      console.log(`📄 Loaded ${documents?.length || 0} documents for ${application.losId} (${appType})`);
    } catch (error) {
      console.error('📄 Failed to load documents:', error);
      // Don't show error to user, just log it
    }
  };

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching details for application:', application.losId);
      const details = await apiService.getApplicationDetails(application.losId);
      
      console.log('✅ Application details fetched:', details);
      setApplicationDetails(details);
      
    } catch (error) {
      console.error('❌ Error fetching application details:', error);
      setError(error.message);
      
      Alert.alert(
        'Error',
        'Failed to fetch application details. Please try again.',
        [
          { text: 'OK', onPress: () => setError(null) },
          { text: 'Retry', onPress: fetchApplicationDetails }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCallApplicant = () => {
    if (applicationDetails?.formData?.mobile) {
      Linking.openURL(`tel:${applicationDetails.formData.mobile}`);
    }
  };

  const handleOpenMaps = () => {
    if (applicationDetails?.formData?.address) {
      const address = encodeURIComponent(applicationDetails.formData.address);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  };

  const handleStartVisit = () => {
    setVisitStatus('in-progress');
    setVisitModalVisible(true);
  };

  const handleMarkVisited = () => {
    setVisitStatus('completed');
    Alert.alert('Visit Completed', 'Application has been marked as visited.');
  };

  const handleUpdateStatus = () => {
    Alert.alert(
      'Submit Application',
      'Are you sure you want to submit this application to EAMVU Head?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => submitToEAMVUHead(),
          style: 'default'
        },
      ]
    );
  };

  const submitToEAMVUHead = async () => {
    try {
      // Validate comments
      const allComments = Object.values(comments).join(' ').trim();
      if (!allComments) {
        Alert.alert(
          'Comments Required',
          'Please add at least one comment before completing the investigation.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('🔄 Completing investigation for EAMVU Head...');
      console.log('📝 Comments:', comments);
      
      // Capture location for geo-tagging
      let locationData = null;
      try {
        setLocationLoading(true);
        locationData = await getCurrentLocation();
        console.log('📍 Location captured for investigation:', locationData);
        
        // Show location confirmation
        await showLocationConfirmation(locationData);
      } catch (locError) {
        console.warn('📍 Could not capture location:', locError);
        // Continue anyway - location is optional
      } finally {
        setLocationLoading(false);
      }
      
      // Combine all comments into investigation notes with location
      const investigationNotes = `
Verification Comments: ${comments.verification || 'N/A'}
Employment Verification: ${comments.employment || 'N/A'}
Neighborhood Feedback: ${comments.neighborhood || 'N/A'}
General Observations: ${comments.observations || 'N/A'}

${locationData ? `
📍 Location: ${formatLocation(locationData)}
Timestamp: ${locationData.formattedTime}
Accuracy: ${Math.round(locationData.accuracy)}m
` : ''}
      `.trim();
      
      // Extract numeric LOS ID
      const losId = application.losId.replace('LOS-', '');
      
      // Get current agent ID (numeric)
      const agentId = global.currentAgent?.id || 101;
      
      // Call API to complete investigation
      await apiService.completeEamvuInvestigation(
        losId,
        applicationDetails.application_type || application.applicationType || 'CashPlus',
        agentId,
        investigationNotes
      );
      
      Alert.alert(
        'Success',
        'Investigation completed successfully!\n\n' + (locationData ? '✓ Location recorded' : ''),
        [
          { 
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error completing investigation:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Failed to complete investigation. Please try again.';
      
      // Try to get more specific error message
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const handleRejectApplication = () => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this application? This action will send it back with negative feedback.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          onPress: () => rejectApplication(),
          style: 'destructive'
        },
      ]
    );
  };

  const rejectApplication = async () => {
    try {
      // Validate comments
      const allComments = Object.values(comments).join(' ').trim();
      if (!allComments) {
        Alert.alert(
          'Comments Required',
          'Please add investigation notes explaining why you are rejecting this application.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('🔄 Rejecting application...');
      console.log('📝 Comments:', comments);
      
      // Capture location for geo-tagging
      let locationData = null;
      try {
        setLocationLoading(true);
        locationData = await getCurrentLocation();
        console.log('📍 Location captured for rejection:', locationData);
        
        // Show location confirmation
        await showLocationConfirmation(locationData);
      } catch (locError) {
        console.warn('📍 Could not capture location:', locError);
        // Continue anyway - location is optional
      } finally {
        setLocationLoading(false);
      }
      
      // Combine all comments into investigation notes with location
      const investigationNotes = `
Verification Comments: ${comments.verification || 'N/A'}
Employment Verification: ${comments.employment || 'N/A'}
Neighborhood Feedback: ${comments.neighborhood || 'N/A'}
General Observations: ${comments.observations || 'N/A'}

${locationData ? `
📍 Location: ${formatLocation(locationData)}
Timestamp: ${locationData.formattedTime}
Accuracy: ${Math.round(locationData.accuracy)}m
` : ''}
      `.trim();
      
      // Extract numeric LOS ID
      const losId = application.losId.replace('LOS-', '');
      
      // Get current agent ID (numeric)
      const agentId = global.currentAgent?.id || 101;
      
      // Call API to reject investigation
      await apiService.rejectEamvuInvestigation(
        losId,
        applicationDetails.application_type || application.applicationType || 'CashPlus',
        agentId,
        investigationNotes
      );
      
      Alert.alert(
        'Application Rejected',
        'Application has been rejected and returned to EAMVU Head.\n\n' + (locationData ? '✓ Location recorded' : ''),
        [
          { 
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error rejecting application:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Failed to reject application. Please try again.';
      
      // Try to get more specific error message
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = () => {
    global.currentAgent = null;
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleChangePassword = () => {
    setSettingsVisible(false);
    Alert.alert(
      'Change Password',
      'Password change functionality will be implemented here.',
      [{ text: 'OK' }]
    );
  };

  const handleSettingsPress = () => {
    setSettingsVisible(true);
  };

  // Upload document to backend
  const uploadToBackend = async (asset) => {
    try {
      console.log('📤 Uploading document:', asset.fileName);
      
      // Generate custom filename: LOSID_EAVMUOFFICER_OFFICERNAME
      const agentName = (global.currentAgent?.name || 'Officer').replace(/\s+/g, '_'); // Replace spaces with underscores
      const timestamp = Date.now();
      const fileExtension = asset.fileName?.split('.').pop() || 'jpg';
      const customFileName = `${application.losId}_EAVMUOFFICER_${agentName}_${timestamp}.${fileExtension}`;
      
      console.log('📝 Custom filename:', customFileName);
      
      // Get application type and normalize to lowercase for folder consistency
      const appType = (applicationDetails?.application_type || applicationDetails?.applicationType || application?.applicationType || 'cashplus').toLowerCase();
      console.log('📂 Using application type:', appType, 'for LOS:', application.losId);
      
      const result = await apiService.uploadDocument(
        application.losId,
        appType,
        asset.uri,
        'investigation_photo',
        customFileName
      );
      
      console.log('✅ Upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  };

  const handleUploadDocument = async () => {
    Alert.alert(
      'Upload Document',
      'Choose how you want to upload a document:',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const result = await launchCamera({
                mediaType: 'photo',
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.8,
                cameraType: 'back',
              });

              if (result.didCancel) return;
              
              if (result.assets && result.assets.length > 0) {
                Alert.alert('Uploading...', 'Please wait while we upload your photo.');
                
                for (const asset of result.assets) {
                  await uploadToBackend(asset);
                }
                
                // Reload documents
                await loadDocuments();
                Alert.alert('Success', `${result.assets.length} photo(s) uploaded successfully!`);
              }
            } catch (err) {
              console.error('Camera error:', err);
              Alert.alert('Error', 'Failed to take photo. Please try again.');
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            try {
              const result = await launchImageLibrary({
                mediaType: 'photo',
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.8,
                selectionLimit: 5,
              });

              if (result.didCancel) return;

              if (result.assets && result.assets.length > 0) {
                Alert.alert('Uploading...', `Uploading ${result.assets.length} document(s)...`);
                
                let successCount = 0;
                for (const asset of result.assets) {
                  try {
                    await uploadToBackend(asset);
                    successCount++;
                  } catch (err) {
                    console.error(`Failed to upload ${asset.fileName}:`, err);
                  }
                }
                
                // Reload documents
                await loadDocuments();
                
                if (successCount === result.assets.length) {
                  Alert.alert('Success', `All ${successCount} document(s) uploaded successfully!`);
                } else {
                  Alert.alert('Partial Success', `${successCount} of ${result.assets.length} document(s) uploaded successfully.`);
                }
              }
            } catch (err) {
              console.error('Gallery error:', err);
              Alert.alert('Error', 'Failed to pick document. Please try again.');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDeleteDocument = (index) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewDocument = (document) => {
    Alert.alert(
      'Document Preview',
      `Name: ${document.name}\nSize: ${document.size}\nType: ${document.type}`,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[APP_CONSTANTS.PRIMARY_COLOR, APP_CONSTANTS.SECONDARY_COLOR, APP_CONSTANTS.PRIMARY_COLOR]}
      style={styles.header}
    >
      <StatusBar backgroundColor={APP_CONSTANTS.PRIMARY_COLOR} barStyle="light-content" />
      
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AppIcon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Application Details</Text>
          <Text style={styles.headerSubtitle}>{application.losId}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <AppIcon name="more-vert" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Loading application details...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AppIcon name="error" size={48} color="#EF4444" />
      <Text style={styles.errorTitle}>Error Loading Details</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchApplicationDetails}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderApplicantInfo = () => {
    if (!applicationDetails?.formData) return null;
    
    const data = applicationDetails.formData;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon name="person" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Applicant Information</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name:</Text>
            <Text style={styles.infoValue}>
              {`${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`.trim()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CNIC:</Text>
            <Text style={styles.infoValue}>{data.cnic || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile:</Text>
            <Text style={styles.infoValue}>{data.mobile || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Father/Husband:</Text>
            <Text style={styles.infoValue}>{data.father_or_husband_name || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>{data.date_of_birth || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Marital Status:</Text>
            <Text style={styles.infoValue}>{data.marital_status || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAddressInfo = () => {
    if (!applicationDetails?.formData) return null;
    
    const data = applicationDetails.formData;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon name="location-on" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Address Information</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Address:</Text>
            <Text style={styles.infoValue}>{data.address || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City:</Text>
            <Text style={styles.infoValue}>{data.city || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permanent Address:</Text>
            <Text style={styles.infoValue}>{data.permanent_street || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permanent City:</Text>
            <Text style={styles.infoValue}>{data.permanent_city || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Residing Since:</Text>
            <Text style={styles.infoValue}>{data.residing_since || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Accommodation Type:</Text>
            <Text style={styles.infoValue}>{data.accommodation_type || 'N/A'}</Text>
          </View>
          
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMaps}>
            <AppIcon name="map" size={20} color="#3B82F6" />
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmploymentInfo = () => {
    if (!applicationDetails?.formData) return null;
    
    const data = applicationDetails.formData;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon name="work" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Employment Information</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employment Status:</Text>
            <Text style={styles.infoValue}>{data.employment_status || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Company Name:</Text>
            <Text style={styles.infoValue}>{data.company_name || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Designation:</Text>
            <Text style={styles.infoValue}>{data.designation || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Office Address:</Text>
            <Text style={styles.infoValue}>{data.office_street || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Office City:</Text>
            <Text style={styles.infoValue}>{data.office_city || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Office Phone:</Text>
            <Text style={styles.infoValue}>{data.office_tel1 || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Experience (Current):</Text>
            <Text style={styles.infoValue}>{data.exp_curren_t_years || 'N/A'} years</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gross Monthly Salary:</Text>
            <Text style={styles.infoValue}>{data.gross_monthly_salary ? `PKR ${data.gross_monthly_salary}` : 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFinancialInfo = () => {
    if (!applicationDetails?.formData) return null;
    
    const data = applicationDetails.formData;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon name="account-balance" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Financial Information</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount Requested:</Text>
            <Text style={styles.infoValue}>{data.amount_requested ? `PKR ${data.amount_requested}` : 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Net Monthly Income:</Text>
            <Text style={styles.infoValue}>{data.net_monthly_income ? `PKR ${data.net_monthly_income}` : 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Other Monthly Income:</Text>
            <Text style={styles.infoValue}>{data.other_monthly_income ? `PKR ${data.other_monthly_income}` : 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Rent:</Text>
            <Text style={styles.infoValue}>{data.monthly_rent ? `PKR ${data.monthly_rent}` : 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>UBL Account Number:</Text>
            <Text style={styles.infoValue}>{data.ubl_account_number || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderReferences = () => {
    if (!applicationDetails?.formData?.references) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon name="people" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>References</Text>
        </View>
        
        <View style={styles.card}>
          {applicationDetails.formData.references.map((ref, index) => (
            <View key={ref.id} style={styles.referenceItem}>
              <Text style={styles.referenceTitle}>Reference {index + 1}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{ref.name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile:</Text>
                <Text style={styles.infoValue}>{ref.mobile || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Relationship:</Text>
                <Text style={styles.infoValue}>{ref.relationship || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{`${ref.street || ''} ${ref.city || ''}`.trim() || 'N/A'}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderVisitActions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppIcon name="assignment" size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Visit Actions</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.visitStatus}>
          <Text style={styles.visitStatusLabel}>Visit Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: visitStatus === 'completed' ? '#059669' : visitStatus === 'in-progress' ? '#F59E0B' : '#6B7280' }]}>
            <Text style={styles.statusBadgeText}>{visitStatus.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton, visitStatus === 'completed' && styles.disabledButton]} 
            onPress={handleStartVisit}
            disabled={visitStatus === 'completed'}
          >
            <AppIcon name="play-arrow" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Start Visit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleCallApplicant}
          >
            <AppIcon name="phone" size={20} color="#3B82F6" />
            <Text style={styles.secondaryButtonText}>Call Applicant</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton, visitStatus !== 'in-progress' && styles.disabledButton]} 
            onPress={handleMarkVisited}
            disabled={visitStatus !== 'in-progress'}
          >
            <AppIcon name="check-circle" size={20} color="white" />
            <Text style={styles.successButtonText}>Mark Visited</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderComments = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppIcon name="assignment" size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Visit Comments</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.commentField}>
          <Text style={styles.commentLabel}>Verification Comments:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Does applicant live here? Any verification notes..."
            value={comments.verification}
            onChangeText={(text) => setComments({...comments, verification: text})}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comments.verification.length}/500</Text>
        </View>
        
        <View style={styles.commentField}>
          <Text style={styles.commentLabel}>Employment Verification:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Office visit details, employment verification..."
            value={comments.employment}
            onChangeText={(text) => setComments({...comments, employment: text})}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comments.employment.length}/500</Text>
        </View>
        
        <View style={styles.commentField}>
          <Text style={styles.commentLabel}>Neighborhood Feedback:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Neighbor verification, community feedback..."
            value={comments.neighborhood}
            onChangeText={(text) => setComments({...comments, neighborhood: text})}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comments.neighborhood.length}/500</Text>
        </View>
        
        <View style={styles.commentField}>
          <Text style={styles.commentLabel}>General Observations:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Lifestyle quality, house condition, occupancy status..."
            value={comments.observations}
            onChangeText={(text) => setComments({...comments, observations: text})}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comments.observations.length}/500</Text>
        </View>
      </View>
    </View>
  );

  const renderUploadDocuments = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppIcon name="upload" size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Upload Documents</Text>
      </View>
      
      <View style={styles.card}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
          <AppIcon name="add" size={24} color="white" />
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </TouchableOpacity>
        
        {uploadedDocuments.length === 0 ? (
          <View style={styles.noDocumentsContainer}>
            <AppIcon name="description" size={40} color="#D1D5DB" />
            <Text style={styles.noDocumentsText}>No documents uploaded yet</Text>
            <Text style={styles.noDocumentsSubtext}>Tap the button above to upload documents</Text>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {uploadedDocuments.map((doc, index) => (
              <TouchableOpacity key={index} style={styles.documentItem} onPress={() => handlePreviewDocument(doc)}>
                <AppIcon name="description" size={20} color="#3B82F6" />
                <Text style={styles.documentName}>{doc.name}</Text>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDocument(index)}>
                  <AppIcon name="delete" size={16} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderSubmitSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppIcon name="assignment" size={20} color={APP_CONSTANTS.PRIMARY_COLOR} />
        <Text style={styles.sectionTitle}>Complete Investigation</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.submitDescription}>
          Review all information and add your investigation comments above. Choose an action to complete the investigation.
        </Text>
        
        <View style={styles.submitButtonsContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, styles.completeButton]} 
            onPress={handleUpdateStatus}
          >
            <AppIcon name="check-circle" size={20} color="white" />
            <Text style={styles.submitButtonText}>Complete Investigation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, styles.rejectButton]} 
            onPress={handleRejectApplication}
          >
            <AppIcon name="error" size={20} color="white" />
            <Text style={styles.submitButtonText}>Reject Application</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderLoadingState()}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderApplicantInfo()}
        {renderAddressInfo()}
        {renderEmploymentInfo()}
        {renderFinancialInfo()}
        {renderReferences()}
        {renderVisitActions()}
        {renderComments()}
        {renderUploadDocuments()}
        {renderSubmitSection()}
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Settings</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSettingsVisible(false)}
              >
                <AppIcon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.settingsOption}
              onPress={handleChangePassword}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <AppIcon name="lock" size={20} color="#3B82F6" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Change Password</Text>
                  <Text style={styles.optionSubtitle}>Update your account password</Text>
                </View>
                <AppIcon name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsOption}
              onPress={handleLogout}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <AppIcon name="logout" size={20} color="#EF4444" />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Logout</Text>
                  <Text style={styles.optionSubtitle}>Sign out of your account</Text>
                </View>
                <AppIcon name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // backgroundColor: '#3B82F6', // Solid blue background
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 2,
    textAlign: 'right',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  mapButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  referenceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 12,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  visitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  visitStatusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  successButton: {
    backgroundColor: '#059669',
  },
  successButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  commentField: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  submitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  submitButtonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#059669', // Green for success
  },
  rejectButton: {
    backgroundColor: '#DC2626', // Red for reject
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  documentsList: {
    marginTop: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
  },
  noDocumentsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noDocumentsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 15,
  },
  noDocumentsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ApplicationDetailScreen;
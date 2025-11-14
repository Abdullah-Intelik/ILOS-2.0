import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../utils/api';
import { APPLICATION_STATUS } from '../utils/config';

const ApplicationStatusScreen = ({ route, navigation }) => {
  const { losId } = route.params;
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadApplicationDetails();
  }, []);

  // Prevent going back to form after submission - always go to Home
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove(); // Use .remove() instead of removeEventListener
    }, [navigation])
  );

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading application details for:', losId);
      const data = await apiService.getApplicationDetails(losId);
      console.log('✅ Application data received:', data);
      setApplication(data);
    } catch (error) {
      console.error('❌ Error loading application:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplicationDetails();
    setRefreshing(false);
  };

  const getStatusInfo = (status) => {
    return APPLICATION_STATUS[status] || { 
      label: status, 
      color: '#9E9E9E', 
      icon: '•' 
    };
  };

  const getProgressPercentage = (status) => {
    const stages = {
      // Backend V2.0 statuses
      PB: 20,
      SPU: 40,
      EAVMU_OFFICER: 60,
      CIU: 80,
      COPS: 90,
      disbursed: 100,
      rejected: 0,
      // Old statuses (backward compatibility)
      PB_SUBMITTED: 20,
      submitted_by_pb: 20,
      submitted_by_spu: 40,
      assigned_to_eavmu_officer: 60,
      submitted_to_ciu: 80,
      application_completed: 90,
      loan_disbursed: 100,
      card_issued: 100,
    };
    return stages[status] || 10;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Application not found</Text>
      </View>
    );
  }

  const statusInfo = getStatusInfo(application.status);
  const progress = getProgressPercentage(application.status);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0F766E', '#14B8A6']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>LOS-{losId}</Text>
          <Text style={styles.headerSubtitle}>{application.loan_type || 'Application'}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F766E']} />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          </View>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={[styles.statusValue, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: statusInfo.color }]} />
            </View>
            <Text style={styles.progressText}>{progress}% Complete</Text>
          </View>
        </View>

        {/* Application Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Application ID:</Text>
              <Text style={styles.detailValue}>LOS-{application.los_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Product Type:</Text>
              <Text style={styles.detailValue}>{application.loan_type || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Applied On:</Text>
              <Text style={styles.detailValue}>
                {new Date(application.created_at).toLocaleDateString()}
              </Text>
            </View>
            {application.amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>
                  PKR {application.amount?.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Journey</Text>
          
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Application Submitted</Text>
                <Text style={styles.timelineDate}>
                  {new Date(application.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
            
            {application.status !== 'PB_SUBMITTED' && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Under Review</Text>
                  <Text style={styles.timelineText}>Your application is being processed</Text>
                </View>
              </View>
            )}
            
            {['application_completed', 'loan_disbursed', 'card_issued', 'disbursed', 'COPS'].includes(application.status) && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotSuccess]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    {application.status === 'disbursed' ? 'Disbursed' : 'Approved'}
                  </Text>
                  <Text style={styles.timelineText}>
                    {application.status === 'disbursed' 
                      ? '🎉 Congratulations! Your loan has been disbursed!' 
                      : 'Congratulations! Your application has been approved'}
                  </Text>
                  {application.disbursed_at && (
                    <Text style={styles.timelineDate}>
                      {new Date(application.disbursed_at).toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Text style={styles.helpIcon}>💬</Text>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Contact our customer support for any queries about your application.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0F766E',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
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
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 40,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F766E',
    marginRight: 12,
    marginTop: 4,
  },
  timelineDotSuccess: {
    backgroundColor: '#4CAF50',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
  },
  helpCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  helpIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  helpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ApplicationStatusScreen;


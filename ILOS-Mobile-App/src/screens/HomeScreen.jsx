import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../utils/api';
import { transformEAMVUApplications, getStatusColor, getPriorityColor } from '../utils/dataTransformer';
import { testBackendConnection } from '../utils/testConnection';
import { API_CONFIG } from '../utils/config';

// Fallback icon component for when MaterialIcons fail to load
const FallbackIcon = ({ name, size, color, style }) => {
  const iconMap = {
    'more-vert': '⋮',
    'arrow-back': '←',
    'phone': '📞',
    'check-circle': '✓',
    'assignment': '📋',
    'person': '👤',
    'location-on': '📍',
    'work': '💼',
    'account-balance': '💰',
    'people': '👥',
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
        fontSize: size * 0.8,
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

const HomeScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Fetch EAMVU applications from backend
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current agent from global storage
      const currentAgent = global.currentAgent;
      if (!currentAgent) {
        setError('No agent information found. Please login again.');
        return;
      }

      console.log('🔄 Fetching applications for agent:', currentAgent.id);
      
      // First, test basic connectivity
      try {
        const healthResponse = await fetch(`${API_CONFIG.API_BASE_URL}/health`);
        if (!healthResponse.ok) {
          throw new Error('Backend health check failed');
        }
        console.log('✅ Backend health check passed');
      } catch (healthError) {
        console.error('❌ Backend health check failed:', healthError);
        setError('Backend server is not accessible. Please check if the server is running.');
        return;
      }
      
      // Use the new API to get assigned applications for this agent
      const applications = await apiService.getAssignedApplicationsForAgent(currentAgent.id);
      
      console.log('✅ Fetched applications:', applications.length);
      setApplications(transformEAMVUApplications(applications));
      
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      setError(error.message);
      
      Alert.alert(
        'Connection Error',
        'Unable to fetch applications. Please check your internet connection and try again.',
        [
          { text: 'OK', onPress: () => setError(null) },
          { text: 'Retry', onPress: fetchApplications },
          { text: 'Test Connection', onPress: handleTestConnection },
          { text: 'Manual Test', onPress: handleManualTest },
          { text: 'Debug Data', onPress: handleDebugData }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Test connection function
  const handleTestConnection = async () => {
    try {
      Alert.alert('Testing Connection', 'Testing backend connection...');
      const result = await testBackendConnection();
      
      if (result.success) {
        Alert.alert('Connection Test', '✅ Backend connection successful!', [
          { text: 'OK', onPress: fetchApplications }
        ]);
      } else {
        Alert.alert('Connection Test', `❌ Connection failed: ${result.message}`, [
          { text: 'OK' }
        ]);
      }
    } catch (error) {
      Alert.alert('Test Error', `Error during connection test: ${error.message}`);
    }
  };

  // Manual test function for debugging
  const handleManualTest = async () => {
    try {
      console.log('🧪 Manual test started...');
      
      // Test 1: Check if we can reach the backend
      console.log('📡 Testing direct fetch to backend...');
      const response = await fetch('https://ilos-backend.vercel.app/api/applications/department/eamvu');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Direct fetch successful:', data);
        Alert.alert('Manual Test', `✅ Direct fetch successful! Found ${data.length} applications.`);
      } else {
        console.log('❌ Direct fetch failed:', response.status, response.statusText);
        Alert.alert('Manual Test', `❌ Direct fetch failed: ${response.status} ${response.statusText}`);
      }
      
      // Test 2: Check agent assignments endpoint
      console.log('📡 Testing agent assignments endpoint...');
      const assignmentsResponse = await fetch('https://ilos-backend.vercel.app/api/applications/test/assignments');
      console.log('📡 Assignments response status:', assignmentsResponse.status);
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        console.log('✅ Agent assignments successful:', assignmentsData);
        Alert.alert('Assignments Test', `✅ Agent assignments working! Found ${assignmentsData.total_assignments} assignments.`);
      } else {
        console.log('❌ Agent assignments failed:', assignmentsResponse.status, assignmentsResponse.statusText);
        Alert.alert('Assignments Test', `❌ Agent assignments failed: ${assignmentsResponse.status} ${assignmentsResponse.statusText}`);
      }
      
    } catch (error) {
      console.error('❌ Manual test error:', error);
      Alert.alert('Manual Test Error', `Error: ${error.message}`);
    }
  };

  // Debug function to test data flow
  const handleDebugData = async () => {
    try {
      console.log('🧪 Debug: Testing data flow...');
      
      // Test 1: Get EAMVU applications
      const eamvuResponse = await fetch('http://10.0.2.2:5000/api/applications/department/eamvu');
      const eamvuData = await eamvuResponse.json();
      console.log('📊 EAMVU applications:', eamvuData.length);
      
      // Test 2: Get agent assignments
      const assignmentsResponse = await fetch('http://10.0.2.2:5000/api/applications/test/assignments');
      const assignmentsData = await assignmentsResponse.json();
      console.log('📊 Total assignments:', assignmentsData.total_assignments);
      
      // Test 3: Filter for agent-001 active assignments
      const agent001Assignments = assignmentsData.assignments.filter(a => 
        a.agent_id === 'agent-001' && a.assignment_status === 'active'
      );
      console.log('📊 Agent-001 active assignments:', agent001Assignments);
      
      // Test 4: Check if assigned applications exist in EAMVU data
      agent001Assignments.forEach(assignment => {
        const matchingApp = eamvuData.find(app => 
          parseInt(app.los_id.replace('LOS-', '')) === assignment.los_id
        );
        console.log(`🔍 Assignment ${assignment.los_id}: found=${!!matchingApp}, status=${matchingApp?.status}`);
      });
      
      Alert.alert('Debug Info', `EAMVU: ${eamvuData.length}, Assignments: ${assignmentsData.total_assignments}, Agent-001 Active: ${agent001Assignments.length}`);
      
    } catch (error) {
      console.error('❌ Debug error:', error);
      Alert.alert('Debug Error', error.message);
    }
  };

  // Initial load
  useEffect(() => {
    fetchApplications();
  }, []);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  // Settings functions
  const handleChangePassword = () => {
    setSettingsVisible(false);
    Alert.alert(
      'Change Password',
      'Password change functionality will be implemented here.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Clear agent information
            global.currentAgent = null;
            // Navigate back to login
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const renderApplication = ({ item }) => (
    <TouchableOpacity
      style={styles.applicationCard}
      onPress={() => navigation.navigate('ApplicationDetail', { application: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.losId}>{item.losId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.displayStatus}</Text>
        </View>
      </View>

      <View style={styles.applicantInfo}>
        <Text style={styles.applicantName}>{item.applicantName}</Text>
        <Text style={styles.applicantPhone}>{item.applicantPhone}</Text>
      </View>

      <View style={styles.loanInfo}>
        <Text style={styles.loanType}>{item.loanType}</Text>
        <Text style={styles.amount}>{item.amount}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority} Priority</Text>
        </View>
        <Text style={styles.address} numberOfLines={2}>
          {item.address}
        </Text>
      </View>

      <View style={styles.documentsInfo}>
        <Text style={styles.documentsText}>
          📄 {item.documents?.length || 0} documents
        </Text>
        <Text style={styles.branchText}>
          🏢 {item.branch}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Applications Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        You don't have any assigned applications at the moment.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchApplications}>
        <Text style={styles.retryButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Loading applications...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchApplications}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#0F766E', '#14B8A6', '#0F766E']}
      style={styles.header}
    >
      <StatusBar backgroundColor="#0F766E" barStyle="light-content" />
      
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoContainer}>
            <Text style={styles.headerLogoIcon}>🏦</Text>
          </View>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.agentName}>{global.currentAgent?.name || 'Agent'}</Text>
          <Text style={styles.agentId}>Agent ID: {global.currentAgent?.id || 'N/A'}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <AppIcon name="more-vert" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Applications</Text>
          <Text style={styles.applicationCount}>{applications.length} applications</Text>
        </View>

        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <FlatList
            data={applications}
            renderItem={renderApplication}
            keyExtractor={(item) => item.id?.toString() || item.losId}
            showsVerticalScrollIndicator={false}
            refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#0F766E']}
              tintColor="#0F766E"
            />
            }
            contentContainerStyle={[
              styles.listContainer,
              applications.length === 0 && styles.emptyListContainer
            ]}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>

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
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.settingsOption}
              onPress={handleChangePassword}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>🔐</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Change Password</Text>
                  <Text style={styles.optionSubtitle}>Update your account password</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsOption}
              onPress={handleLogout}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>🚪</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Logout</Text>
                  <Text style={styles.optionSubtitle}>Sign out of your account</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerCenter: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  agentName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  agentId: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLogoIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  applicationCount: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  losId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  applicantInfo: {
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  applicantPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  loanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanType: {
    fontSize: 14,
    color: '#6b7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    textAlign: 'right',
  },
  documentsInfo: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  branchText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#0F766E',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  settingsOption: {
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionArrow: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
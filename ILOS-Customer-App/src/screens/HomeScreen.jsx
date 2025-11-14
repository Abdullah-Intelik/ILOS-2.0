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
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useApplication } from '../contexts/ApplicationContext';
import apiService from '../utils/api';
import { getCustomerData, removeCustomerData } from '../utils/storage';
import { APPLICATION_STATUS } from '../utils/config';

const HomeScreen = ({ navigation }) => {
  const { drafts, loadDrafts, applications, setApplications } = useApplication();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  // Refresh customer data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshCustomerData = async () => {
        try {
          const customerData = await getCustomerData();
          if (customerData) {
            setCustomer(customerData);
            console.log('🔄 Customer data refreshed on focus:', customerData.name);
          }
        } catch (error) {
          console.log('Failed to refresh customer data:', error);
        }
      };
      refreshCustomerData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load customer data with fallback
      let loadedCustomer = null;
      try {
        const customerData = await getCustomerData();
        if (customerData) {
          setCustomer(customerData);
          loadedCustomer = customerData;
        } else {
          // Fallback for missing customer data
          setCustomer({ name: 'Guest', isGuest: true });
          loadedCustomer = { name: 'Guest', isGuest: true };
        }
      } catch (storageError) {
        console.log('Storage error (non-critical):', storageError);
        setCustomer({ name: 'Guest', isGuest: true });
        loadedCustomer = { name: 'Guest', isGuest: true };
      }

      // Load drafts
      await loadDrafts();

      // Load applications if not guest (use loadedCustomer to avoid timing issue)
      if (loadedCustomer && !loadedCustomer.isGuest) {
        await loadApplications();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await apiService.getMyApplications();
      const apps = response.applications || [];
      setApplications(apps);
      
      // Calculate stats
      const totalApps = apps.length;
      const pending = apps.filter(a => 
        !['application_completed', 'loan_disbursed', 'card_issued', 'rejected'].includes(a.status)
      ).length;
      const approved = apps.filter(a => 
        ['application_completed', 'loan_disbursed', 'card_issued'].includes(a.status)
      ).length;
      const rejected = apps.filter(a => a.status === 'rejected' || a.status?.includes('rejected')).length;

      setStats({ totalApplications: totalApps, pending, approved, rejected });
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
          onPress: async () => {
            await removeCustomerData();
            await apiService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const getStatusInfo = (status) => {
    return APPLICATION_STATUS[status] || { 
      label: status, 
      color: '#9E9E9E', 
      icon: '•' 
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0F766E', '#14B8A6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.customerName}>
              {customer?.name || 'Guest'} {customer?.isGuest ? '(Guest)' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F766E']} />
        }
      >
        {/* Stats Cards */}
        {!customer?.isGuest && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#0F766E' }]}>
                <Text style={styles.statNumber}>{stats.totalApplications}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
                <Text style={styles.statNumber}>{stats.approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.statNumber}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductSelection')}
          >
            <LinearGradient
              colors={['#0F766E', '#14B8A6']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>New Application</Text>
                <Text style={styles.actionSubtitle}>Apply for loan or credit card</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {!customer?.isGuest && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('MyApplications')}
            >
              <View style={styles.actionCard}>
                <Text style={styles.actionIconSecondary}>📄</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitleSecondary}>My Applications</Text>
                  <Text style={styles.actionSubtitleSecondary}>View and track applications</Text>
                </View>
                <Text style={styles.actionArrowSecondary}>›</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Drafts Section */}
        {drafts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Drafts ({drafts.length})</Text>
            </View>
            
            {drafts.slice(0, 3).map((draft) => (
              <TouchableOpacity
                key={draft.id}
                style={styles.draftCard}
                onPress={() => navigation.navigate('ApplicationForm', { draftId: draft.id })}
              >
                <View style={styles.draftIcon}>
                  <Text style={styles.draftIconText}>📝</Text>
                </View>
                <View style={styles.draftInfo}>
                  <Text style={styles.draftTitle}>{draft.productType || 'Draft Application'}</Text>
                  <Text style={styles.draftDate}>
                    Saved {new Date(draft.savedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.draftArrow}>›</Text>
              </TouchableOpacity>
            ))}

            {drafts.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Drafts')}
              >
                <Text style={styles.viewAllText}>View All Drafts ({drafts.length})</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Recent Applications */}
        {!customer?.isGuest && applications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Applications</Text>
            </View>
            
            {applications.slice(0, 3).map((app) => {
              const statusInfo = getStatusInfo(app.status);
              return (
                <TouchableOpacity
                  key={app.los_id}
                  style={styles.applicationCard}
                  onPress={() => navigation.navigate('ApplicationStatus', { losId: app.los_id })}
                >
                  <View style={styles.applicationHeader}>
                    <View>
                      <Text style={styles.applicationTitle}>
                        {app.loan_type || 'Application'}
                      </Text>
                      <Text style={styles.applicationId}>LOS-{app.los_id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                      <Text style={styles.statusText}>{statusInfo.icon}</Text>
                    </View>
                  </View>
                  <View style={styles.applicationFooter}>
                    <Text style={styles.applicationDate}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.applicationStatus, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {applications.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('MyApplications')}
              >
                <Text style={styles.viewAllText}>View All Applications</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State */}
        {!customer?.isGuest && applications.length === 0 && drafts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyText}>
              Start your journey by creating a new application
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('ProductSelection')}
            >
              <Text style={styles.emptyButtonText}>Create Application</Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  actionIconSecondary: {
    fontSize: 28,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionTitleSecondary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  actionSubtitleSecondary: {
    fontSize: 14,
    color: '#666',
  },
  actionArrow: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  actionArrowSecondary: {
    fontSize: 28,
    color: '#0F766E',
    fontWeight: 'bold',
  },
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  draftIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  draftIconText: {
    fontSize: 24,
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  draftDate: {
    fontSize: 12,
    color: '#999',
  },
  draftArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  applicationId: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationDate: {
    fontSize: 12,
    color: '#999',
  },
  applicationStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F766E',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;


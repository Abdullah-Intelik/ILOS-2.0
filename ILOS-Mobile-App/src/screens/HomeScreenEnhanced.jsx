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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import apiService from '../utils/api';
import { transformEAMVUApplications } from '../utils/dataTransformer';
import { APP_CONSTANTS, API_CONFIG } from '../utils/config';
import StatCard from '../components/StatCard';
import ApplicationCard from '../components/ApplicationCard';
import EmptyState from '../components/EmptyState';

const HomeScreenEnhanced = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate dashboard stats
  const stats = {
    total: applications.length,
    pending: applications.filter(app => 
      app.status?.toLowerCase().includes('assigned')
    ).length,
    completed: applications.filter(app => 
      app.status?.toLowerCase().includes('completed') || 
      app.status?.toLowerCase().includes('returned_by_eavmu_officer')
    ).length,
    highPriority: applications.filter(app => 
      app.priority?.toLowerCase() === 'high'
    ).length,
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentAgent = global.currentAgent;
      if (!currentAgent) {
        setError('No agent information found. Please login again.');
        return;
      }

      console.log('🔄 Fetching applications for agent:', currentAgent.id);
      
      // Test connectivity
      try {
        const healthResponse = await fetch(`${API_CONFIG.API_BASE_URL}/health`);
        if (!healthResponse.ok) {
          throw new Error('Backend health check failed');
        }
        console.log('✅ Backend health check passed');
      } catch (healthError) {
        console.error('❌ Backend health check failed:', healthError);
        setError('Backend server is not accessible.');
        return;
      }
      
      const applications = await apiService.getAssignedApplicationsForAgent(currentAgent.id);
      console.log('✅ Fetched applications:', applications.length);
      setApplications(transformEAMVUApplications(applications));
      
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      setError(error.message);
      
      Alert.alert(
        'Connection Error',
        'Unable to fetch applications. Please check your connection and try again.',
        [
          { text: 'OK' },
          { text: 'Retry', onPress: fetchApplications }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
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
          onPress: () => {
            global.currentAgent = null;
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const renderHeader = () => {
    const currentAgent = global.currentAgent;
    
    return (
      <View>
        {/* Header Gradient */}
        <LinearGradient
          colors={['#0F766E', '#14B8A6']}
          style={styles.header}
        >
          <StatusBar backgroundColor="#0F766E" barStyle="light-content" />
          
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.agentName}>{currentAgent?.name || 'Officer'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCardSmall}>
              <StatCard
                title="Total Assigned"
                value={stats.total.toString()}
                icon="📋"
                colors={['#0F766E', '#14B8A6']}
              />
            </View>
            <View style={styles.statCardSmall}>
              <StatCard
                title="Pending"
                value={stats.pending.toString()}
                icon="⏳"
                colors={['#F59E0B', '#FBBF24']}
              />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCardSmall}>
              <StatCard
                title="Completed"
                value={stats.completed.toString()}
                icon="✅"
                colors={['#059669', '#10B981']}
              />
            </View>
            <View style={styles.statCardSmall}>
              <StatCard
                title="High Priority"
                value={stats.highPriority.toString()}
                icon="🔴"
                colors={['#DC2626', '#EF4444']}
              />
            </View>
          </View>
        </View>

        {/* Applications List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Assigned Applications</Text>
          <Text style={styles.listCount}>{applications.length} total</Text>
        </View>
      </View>
    );
  };

  const renderApplication = ({ item }) => (
    <ApplicationCard
      application={item}
      onPress={() => navigation.navigate('ApplicationDetail', { application: item })}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="📋"
        title="No Applications Assigned"
        subtitle="You don't have any assigned applications yet. Check back later."
      />
    );
  };

  if (loading && applications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0F766E', '#14B8A6']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id || item.losId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#14B8A6']}
            tintColor="#14B8A6"
          />
        }
        contentContainerStyle={applications.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  agentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCardSmall: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  listCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default HomeScreenEnhanced;


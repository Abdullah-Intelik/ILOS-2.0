import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import apiService from '../utils/api';
import { APPLICATION_STATUS } from '../utils/config';
import { useApplication } from '../contexts/ApplicationContext';

const MyApplicationsScreen = ({ navigation }) => {
  const { applications, setApplications } = useApplication();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await apiService.getMyApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const getStatusInfo = (status) => {
    return APPLICATION_STATUS[status] || { 
      label: status, 
      color: '#9E9E9E', 
      icon: '•' 
    };
  };

  const getFilteredApplications = () => {
    if (filter === 'all') return applications;
    if (filter === 'pending') {
      return applications.filter(a => 
        !['application_completed', 'loan_disbursed', 'card_issued', 'rejected'].includes(a.status)
      );
    }
    if (filter === 'completed') {
      return applications.filter(a => 
        ['application_completed', 'loan_disbursed', 'card_issued'].includes(a.status)
      );
    }
    if (filter === 'rejected') {
      return applications.filter(a => a.status === 'rejected' || a.status?.includes('rejected'));
    }
    return applications;
  };

  const renderApplicationCard = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={styles.applicationCard}
        onPress={() => navigation.navigate('ApplicationStatus', { losId: item.los_id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.applicationTitle}>{item.loan_type || 'Application'}</Text>
            <Text style={styles.applicationId}>LOS-{item.los_id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Applied On:</Text>
            <Text style={styles.infoValue}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          {item.amount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount:</Text>
              <Text style={styles.infoValue}>PKR {item.amount?.toLocaleString()}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
          <Text style={styles.viewDetails}>View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading applications...</Text>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Text style={styles.headerSubtitle}>{applications.length} total applications</Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'completed', 'rejected'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Applications List */}
      <FlatList
        data={getFilteredApplications()}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.los_id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F766E']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No applications found</Text>
          </View>
        }
      />
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: '#0F766E',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 20,
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  applicationId: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
  },
  cardBody: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewDetails: {
    fontSize: 14,
    color: '#0F766E',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MyApplicationsScreen;


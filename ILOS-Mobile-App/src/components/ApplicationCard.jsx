import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { APP_CONSTANTS } from '../utils/config';

const ApplicationCard = ({ application, onPress }) => {
  const getStatusColor = (status) => {
    const colors = {
      'assigned_to_eavmu_officer': '#14B8A6',
      'returned_by_eavmu_officer': '#10B981',
      'pending': '#F59E0B',
      'completed': '#059669',
      'rejected': '#DC2626',
    };
    return colors[status?.toLowerCase()] || '#6B7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#DC2626',
      'medium': '#F59E0B',
      'low': '#10B981',
    };
    return colors[priority?.toLowerCase()] || '#6B7280';
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const statusColor = getStatusColor(application.status);
  const priorityColor = getPriorityColor(application.priority);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.losId}>{application.losId}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}15` }]}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {application.priority || 'Medium'}
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      {/* Applicant Info */}
      <View style={styles.infoRow}>
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.infoText} numberOfLines={1}>
          {application.applicantName || 'Unknown'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>📱</Text>
        <Text style={styles.infoText} numberOfLines={1}>
          {application.phone || 'N/A'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>💼</Text>
        <Text style={styles.infoText} numberOfLines={1}>
          {application.applicationType || 'CashPlus'}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {formatStatus(application.status)}
          </Text>
        </View>
        {application.assignedDate && (
          <Text style={styles.dateText}>
            {new Date(application.assignedDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  losId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  icon: {
    fontSize: 16,
    width: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ApplicationCard;


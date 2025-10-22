import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusBadge = ({ status, size = 'medium' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'In Progress':
        return '#3b82f6';
      case 'Completed':
        return '#10b981';
      case 'Rejected':
        return '#ef4444';
      case 'Collected':
        return '#8b5cf6';
      case 'Verified':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          fontSize: 10,
        };
      case 'large':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 14,
        };
      default:
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          fontSize: 12,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getStatusColor(status),
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
  },
  text: {
    fontWeight: '600',
    color: 'white',
  },
});

export default StatusBadge;
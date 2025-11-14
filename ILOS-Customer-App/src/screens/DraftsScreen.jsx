import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useApplication } from '../contexts/ApplicationContext';
import Toast from 'react-native-toast-message';

const DraftsScreen = ({ navigation }) => {
  const { drafts, deleteDraft, loadDrafts } = useApplication();

  const handleDeleteDraft = (draftId) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteDraft(draftId);
            if (success) {
              Toast.show({
                type: 'success',
                text1: 'Draft Deleted',
                text2: 'The draft has been removed',
              });
            }
          },
        },
      ]
    );
  };

  const renderDraftCard = ({ item }) => (
    <View style={styles.draftCard}>
      <TouchableOpacity
        style={styles.draftContent}
        onPress={() => navigation.navigate('ApplicationForm', { draftId: item.id })}
      >
        <View style={styles.draftIcon}>
          <Text style={styles.draftIconText}>📝</Text>
        </View>
        <View style={styles.draftInfo}>
          <Text style={styles.draftTitle}>{item.productType || 'Draft Application'}</Text>
          <Text style={styles.draftDate}>
            Saved on {new Date(item.savedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.draftStep}>Step {(item.step || 0) + 1} of 5</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteDraft(item.id)}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Saved Drafts</Text>
        <Text style={styles.headerSubtitle}>{drafts.length} draft(s)</Text>
      </LinearGradient>

      {/* Drafts List */}
      <FlatList
        data={drafts}
        renderItem={renderDraftCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Drafts</Text>
            <Text style={styles.emptyText}>
              You don't have any saved drafts yet
            </Text>
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
  listContent: {
    padding: 20,
  },
  draftCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  draftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  draftIconText: {
    fontSize: 28,
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  draftDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  draftStep: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteIcon: {
    fontSize: 20,
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
  },
});

export default DraftsScreen;


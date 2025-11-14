import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useApplication } from '../contexts/ApplicationContext';
import { PRODUCT_TYPES } from '../utils/config';

const { width } = Dimensions.get('window');

const ProductSelectionScreen = ({ navigation }) => {
  const { startNewApplication } = useApplication();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products = Object.values(PRODUCT_TYPES);

  const categories = [
    { id: 'all', label: 'All Products', count: products.length },
    { id: 'loans', label: 'Loans', count: 5 },
    { id: 'cards', label: 'Cards', count: 2 },
  ];

  const getFilteredProducts = () => {
    if (selectedCategory === 'all') return products;
    if (selectedCategory === 'loans') {
      return products.filter(p => 
        ['cashplus', 'autoloan', 'smeasaan', 'ameendrive', 'commercial_vehicle', 'instantloan'].includes(p.id)
      );
    }
    if (selectedCategory === 'cards') {
      return products.filter(p => ['platinum_card', 'classic_card'].includes(p.id));
    }
    return products;
  };

  const handleProductSelect = (product) => {
    startNewApplication(product.name);
    // Navigate to document upload first, then to application form
    navigation.navigate('DocumentUpload', { productType: product.name });
  };

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose Product</Text>
          <Text style={styles.headerSubtitle}>Select the product you want to apply for</Text>
        </View>
      </LinearGradient>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.label} ({category.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.productsContainer}
      >
        {getFilteredProducts().map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductSelect(product)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[product.color, product.color + 'CC']}
              style={styles.productGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.productHeader}>
                <Text style={styles.productIcon}>{product.icon}</Text>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>Apply Now</Text>
                </View>
              </View>
              
              <Text style={styles.productName}>{product.displayName}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              
              <View style={styles.productFooter}>
                {product.minAmount && product.maxAmount ? (
                  <View style={styles.productDetail}>
                    <Text style={styles.productDetailLabel}>Amount Range</Text>
                    <Text style={styles.productDetailValue}>
                      PKR {(product.minAmount / 1000).toFixed(0)}K - {(product.maxAmount / 1000000).toFixed(1)}M
                    </Text>
                  </View>
                ) : product.creditLimit ? (
                  <View style={styles.productDetail}>
                    <Text style={styles.productDetailLabel}>Credit Limit</Text>
                    <Text style={styles.productDetailValue}>PKR {product.creditLimit}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.productAction}>
                <Text style={styles.productActionText}>Get Started</Text>
                <Text style={styles.productActionArrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 You can save your progress as a draft anytime
        </Text>
      </View>
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
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categories: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#0F766E',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  productsContainer: {
    padding: 20,
  },
  productCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  productGradient: {
    padding: 24,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productIcon: {
    fontSize: 48,
  },
  productBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  productBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  productFooter: {
    marginBottom: 16,
  },
  productDetail: {
    marginBottom: 8,
  },
  productDetailLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 4,
  },
  productDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  productAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  productActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  productActionArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProductSelectionScreen;


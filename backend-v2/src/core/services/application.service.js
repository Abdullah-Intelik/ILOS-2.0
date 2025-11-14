/**
 * Application Service
 * Business logic for applications
 */

const { ApplicationRepository } = require('../../infrastructure/repositories');
const { getConfigService } = require('../../config/config.service');

class ApplicationService {
  constructor(db) {
    this.repository = new ApplicationRepository(db);
    this.configService = getConfigService();
  }

  /**
   * Get application by LOS ID
   */
  async getByLosId(losId) {
    try {
      const application = await this.repository.findByLosId(losId);
      
      if (!application) {
        throw new Error(`Application ${losId} not found`);
      }

      return application;
    } catch (error) {
      console.error('Error getting application:', error);
      throw error;
    }
  }

  /**
   * Get application summary (with all details)
   */
  async getApplicationSummary(losId) {
    try {
      const summary = await this.repository.getApplicationSummary(losId);
      
      if (!summary) {
        throw new Error(`Application ${losId} not found`);
      }

      return summary;
    } catch (error) {
      console.error('Error getting application summary:', error);
      throw error;
    }
  }

  /**
   * Create new application
   */
  async createApplication(data, userId) {
    try {
      // 1. Validate product exists and is active
      const product = this.configService.getProduct(data.product_code);
      if (!product || !product.active) {
        throw new Error(`Product ${data.product_code} is not available`);
      }

      // 2. Check eligibility
      this.validateEligibility(data, product);

      // 3. Prepare application data
      const applicationData = {
        party_id: data.party_id,
        product_id: data.product_id,
        product_type: product.type,
        application_type: data.application_type || 'new',
        purpose: data.purpose,
        requested_amount: data.requested_amount,
        tenure_months: data.tenure_months,
        status: 'draft',
        source: data.source || 'web',
        submitted_by: userId,
        automation_eligible: this.isAutomationEligible(data, product)
      };

      // 4. Prepare product-specific details
      const productDetails = this.extractProductDetails(data, product.type);

      // 5. Create application
      const application = await this.repository.createWithProductDetails(
        applicationData,
        productDetails,
        product.type
      );

      console.log(`✅ Application created: LOS-${application.los_id}`);
      return application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  /**
   * Submit application
   */
  async submitApplication(losId, userId) {
    try {
      const application = await this.repository.findByLosId(losId);
      
      if (!application) {
        throw new Error(`Application ${losId} not found`);
      }

      if (application.status !== 'draft') {
        throw new Error(`Application ${losId} is already submitted`);
      }

      // Update status to submitted
      const updated = await this.repository.updateStatus(
        losId,
        'submitted',
        userId,
        'Application submitted'
      );

      // Queue for automation if eligible
      if (updated.automation_eligible) {
        await this.queueForAutomation(updated);
      }

      console.log(`✅ Application LOS-${losId} submitted`);
      return updated;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  async updateStatus(losId, newStatus, userId, comments = null) {
    try {
      const updated = await this.repository.updateStatus(losId, newStatus, userId, comments);
      console.log(`✅ Application LOS-${losId} status updated to ${newStatus}`);
      return updated;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Get applications by party
   */
  async getByParty(partyId, options = {}) {
    try {
      return await this.repository.findByParty(partyId, options);
    } catch (error) {
      console.error('Error getting applications by party:', error);
      throw error;
    }
  }

  /**
   * Get applications by status
   */
  async getByStatus(status, options = {}) {
    try {
      return await this.repository.findByStatus(status, options);
    } catch (error) {
      console.error('Error getting applications by status:', error);
      throw error;
    }
  }

  /**
   * Get assigned applications
   */
  async getAssignedApplications(userId, options = {}) {
    try {
      return await this.repository.findByAssignedUser(userId, options);
    } catch (error) {
      console.error('Error getting assigned applications:', error);
      throw error;
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics() {
    try {
      return await this.repository.getDashboardMetrics();
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Validate eligibility
   */
  validateEligibility(data, product) {
    const { eligibility, limits } = product;

    // Check amount limits
    if (data.requested_amount < limits.minAmount || data.requested_amount > limits.maxAmount) {
      throw new Error(
        `Amount must be between ${limits.minAmount} and ${limits.maxAmount}`
      );
    }

    // Check tenure limits
    if (data.tenure_months < limits.minTenure || data.tenure_months > limits.maxTenure) {
      throw new Error(
        `Tenure must be between ${limits.minTenure} and ${limits.maxTenure} months`
      );
    }

    // Check income requirement
    if (eligibility.minIncome && data.monthly_income < eligibility.minIncome) {
      throw new Error(
        `Minimum monthly income requirement: ${eligibility.minIncome}`
      );
    }

    return true;
  }

  /**
   * Check if automation eligible
   */
  isAutomationEligible(data, product) {
    const automationConfig = this.configService.get('features.automation');
    
    if (!automationConfig || !automationConfig.enabled) {
      return false;
    }

    // Check if product is instant eligible
    if (product.instantEligible) {
      const instantConfig = this.configService.get('features.instantLoan');
      if (instantConfig && instantConfig.enabled) {
        // Check customer type eligibility
        const eligibleTypes = instantConfig.eligibleCustomerTypes || ['ETB'];
        return eligibleTypes.includes(data.customer_type);
      }
    }

    return false;
  }

  /**
   * Extract product-specific details
   */
  extractProductDetails(data, productType) {
    const details = {};

    switch (productType) {
      case 'personal_loan':
        details.loan_type = data.loan_type;
        details.min_acceptable_amount = data.min_acceptable_amount;
        details.max_affordable_installment = data.max_affordable_installment;
        break;

      case 'auto_loan':
        details.vehicle_make = data.vehicle_make;
        details.vehicle_model = data.vehicle_model;
        details.year_of_manufacture = data.year_of_manufacture;
        details.variant = data.variant;
        details.engine_capacity = data.engine_capacity;
        details.vehicle_price = data.vehicle_price;
        details.down_payment = data.down_payment;
        details.financing_amount = data.financing_amount;
        break;

      case 'credit_card':
        details.preferred_card_type = data.preferred_card_type;
        details.requested_credit_limit = data.requested_credit_limit;
        details.existing_cards_count = data.existing_cards_count || 0;
        details.residential_ownership = data.residential_ownership;
        details.duration_at_address_months = data.duration_at_address_months;
        break;

      case 'islamic_finance':
        details.finance_type = data.finance_type;
        details.declared_purpose = data.declared_purpose;
        details.financing_mode = data.financing_mode;
        details.shariah_compliance_declaration = data.shariah_compliance_declaration;
        break;
    }

    return details;
  }

  /**
   * Queue for automation
   */
  async queueForAutomation(application) {
    try {
      // This will be implemented with automation queue
      console.log(`📋 Queuing application LOS-${application.los_id} for automation`);
      
      // TODO: Insert into automation_queue table
      
      return true;
    } catch (error) {
      console.error('Error queuing for automation:', error);
      // Don't throw - automation queue failure shouldn't block submission
      return false;
    }
  }
}

module.exports = { ApplicationService };


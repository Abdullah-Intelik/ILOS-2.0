/**
 * Party Service
 * Business logic for parties (customers)
 */

const { PartyRepository } = require('../../infrastructure/repositories');

class PartyService {
  constructor(db) {
    this.repository = new PartyRepository(db);
  }

  /**
   * Get party by ID
   */
  async getById(partyId) {
    try {
      const party = await this.repository.getWithDetails(partyId);
      
      if (!party) {
        throw new Error(`Party ${partyId} not found`);
      }

      return party;
    } catch (error) {
      console.error('Error getting party:', error);
      throw error;
    }
  }

  /**
   * Get party by CNIC
   */
  async getByCnic(cnic) {
    try {
      const party = await this.repository.findByCnic(cnic);
      
      if (!party) {
        return null; // Not found is not an error for CNIC lookup
      }

      // Get full details
      return await this.repository.getWithDetails(party.party_id);
    } catch (error) {
      console.error('Error getting party by CNIC:', error);
      throw error;
    }
  }

  /**
   * Find party by CNIC (alias for getByCnic)
   * Used by application.service.v2.js
   */
  async findByCnic(cnic) {
    return await this.getByCnic(cnic);
  }

  /**
   * Create new party
   */
  async createParty(data) {
    try {
      // Check if party with same CNIC already exists
      const existing = await this.repository.findByCnic(data.cnic);
      if (existing) {
        throw new Error(`Party with CNIC ${data.cnic} already exists`);
      }

      // Prepare party data
      const partyData = {
        cnic: data.cnic,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        marital_status: data.marital_status,
        mobile: data.mobile,
        email: data.email,
        residential_address: data.residential_address,
        city: data.city,
        customer_type: data.customer_type || 'NTB',
        cbs_customer_id: data.cbs_customer_id,
        cbs_account_number: data.cbs_account_number
      };

      // Prepare party details
      const detailsData = {
        employment_type: data.employment_type,
        employer_name: data.employer_name,
        designation: data.designation,
        employment_tenure_months: data.employment_tenure_months,
        office_address: data.office_address,
        monthly_income: data.monthly_income,
        bank_name: data.bank_name,
        account_number: data.account_number
      };

      const party = await this.repository.createWithDetails(partyData, detailsData);
      
      console.log(`✅ Party created: ${party.party_id} (CNIC: ${party.cnic})`);
      return party;
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  }

  /**
   * Update party information
   */
  async updateParty(partyId, data) {
    try {
      const party = await this.repository.findById(partyId, 'party_id');
      
      if (!party) {
        throw new Error(`Party ${partyId} not found`);
      }

      // Update party basic info
      const partyUpdates = {
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        marital_status: data.marital_status,
        mobile: data.mobile,
        email: data.email,
        residential_address: data.residential_address,
        city: data.city
      };

      // Remove undefined values
      Object.keys(partyUpdates).forEach(key => 
        partyUpdates[key] === undefined && delete partyUpdates[key]
      );

      const updated = await this.repository.update(partyId, partyUpdates, 'party_id');

      // Update party details if provided
      if (data.employment_type || data.employer_name || data.monthly_income) {
        const detailsUpdates = {
          employment_type: data.employment_type,
          employer_name: data.employer_name,
          designation: data.designation,
          employment_tenure_months: data.employment_tenure_months,
          office_address: data.office_address,
          monthly_income: data.monthly_income,
          bank_name: data.bank_name,
          account_number: data.account_number
        };

        // Remove undefined values
        Object.keys(detailsUpdates).forEach(key => 
          detailsUpdates[key] === undefined && delete detailsUpdates[key]
        );

        await this.repository.updateDetails(partyId, detailsUpdates);
      }

      console.log(`✅ Party ${partyId} updated`);
      return updated;
    } catch (error) {
      console.error('Error updating party:', error);
      throw error;
    }
  }

  /**
   * Sync party with CBS data
   */
  async syncWithCBS(partyId, cbsData) {
    try {
      const party = await this.repository.findById(partyId, 'party_id');
      
      if (!party) {
        throw new Error(`Party ${partyId} not found`);
      }

      const synced = await this.repository.syncWithCBS(partyId, cbsData);
      
      console.log(`✅ Party ${partyId} synced with CBS`);
      return synced;
    } catch (error) {
      console.error('Error syncing party with CBS:', error);
      throw error;
    }
  }

  /**
   * Check if party is ETB (Existing to Bank)
   */
  async isETB(cnic) {
    try {
      const party = await this.repository.findByCnic(cnic);
      return party && party.customer_type === 'ETB';
    } catch (error) {
      console.error('Error checking ETB status:', error);
      return false;
    }
  }

  /**
   * Convert NTB to ETB
   */
  async convertToETB(partyId, cbsCustomerId, cbsAccountNumber) {
    try {
      const synced = await this.repository.syncWithCBS(partyId, {
        customer_id: cbsCustomerId,
        account_number: cbsAccountNumber
      });
      
      console.log(`✅ Party ${partyId} converted from NTB to ETB`);
      return synced;
    } catch (error) {
      console.error('Error converting party to ETB:', error);
      throw error;
    }
  }
}

module.exports = { PartyService };


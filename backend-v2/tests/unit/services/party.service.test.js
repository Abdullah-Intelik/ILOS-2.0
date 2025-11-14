/**
 * Unit Tests - Party Service
 * Tests business logic for party (customer) operations
 */

const { PartyService } = require('../../../src/core/services/party.service');

// Create mock repository
const mockRepository = {
  findByCnic: jest.fn(),
  findById: jest.fn(),
  getWithDetails: jest.fn(),
  createWithDetails: jest.fn(),
  update: jest.fn(),
  updateDetails: jest.fn(),
  syncWithCBS: jest.fn(),
};

// Mock PartyRepository module
jest.mock('../../../src/infrastructure/repositories/party.repository', () => {
  return jest.fn().mockImplementation(() => mockRepository);
});

describe('PartyService', () => {
  let partyService;
  let mockDb;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock database
    mockDb = {
      query: jest.fn(),
      getClient: jest.fn(),
    };
    
    // Create service
    partyService = new PartyService(mockDb);
  });

  describe('getByCnic', () => {
    it('should return party with details for valid CNIC', async () => {
      const mockParty = {
        party_id: 1,
        cnic: '1234567890123',
        first_name: 'Ahmed',
        last_name: 'Khan'
      };

      const mockPartyDetails = {
        ...mockParty,
        monthly_income: 150000,
        employment_type: 'Salaried'
      };

      mockRepository.findByCnic.mockResolvedValue(mockParty);
      mockRepository.getWithDetails.mockResolvedValue(mockPartyDetails);

      const result = await partyService.getByCnic('1234567890123');

      expect(result).toEqual(mockPartyDetails);
      expect(mockRepository.findByCnic).toHaveBeenCalledWith('1234567890123');
      expect(mockRepository.getWithDetails).toHaveBeenCalledWith(1);
    });

    it('should return null for non-existent CNIC', async () => {
      mockRepository.findByCnic.mockResolvedValue(null);

      const result = await partyService.getByCnic('9999999999999');

      expect(result).toBeNull();
      expect(mockRepository.getWithDetails).not.toHaveBeenCalled();
    });

    it('should throw error for invalid CNIC format', async () => {
      mockRepository.findByCnic.mockRejectedValue(new Error('Database error'));

      await expect(partyService.getByCnic('invalid'))
        .rejects.toThrow('Database error');
    });
  });

  describe('createParty', () => {
    it('should create new party successfully', async () => {
      const newPartyData = {
        cnic: '1234567890123',
        first_name: 'Ahmed',
        last_name: 'Khan',
        date_of_birth: '1990-01-01',
        mobile: '03001234567',
        email: 'ahmed@example.com',
        customer_type: 'ETB',
        monthly_income: 150000
      };

      const createdParty = {
        party_id: 1,
        ...newPartyData,
        created_at: new Date()
      };

      mockRepository.findByCnic.mockResolvedValue(null);
      mockRepository.createWithDetails.mockResolvedValue(createdParty);

      const result = await partyService.createParty(newPartyData);

      expect(result).toEqual(createdParty);
      expect(mockRepository.createWithDetails).toHaveBeenCalled();
    });

    it('should throw error if party already exists', async () => {
      const existingParty = { party_id: 1, cnic: '1234567890123' };
      mockRepository.findByCnic.mockResolvedValue(existingParty);

      await expect(partyService.createParty({ cnic: '1234567890123' }))
        .rejects.toThrow('Party with CNIC 1234567890123 already exists');
    });
  });

  describe('isETB', () => {
    it('should return true for ETB customer', async () => {
      const etbParty = { party_id: 1, cnic: '1234567890123', customer_type: 'ETB' };
      mockRepository.findByCnic.mockResolvedValue(etbParty);

      const result = await partyService.isETB('1234567890123');

      expect(result).toBe(true);
    });

    it('should return false for NTB customer', async () => {
      const ntbParty = { party_id: 1, cnic: '1234567890123', customer_type: 'NTB' };
      mockRepository.findByCnic.mockResolvedValue(ntbParty);

      const result = await partyService.isETB('1234567890123');

      expect(result).toBe(false);
    });

    it('should return false for non-existent customer', async () => {
      mockRepository.findByCnic.mockResolvedValue(null);

      const result = await partyService.isETB('9999999999999');

      expect(result).toBe(false);
    });
  });
});

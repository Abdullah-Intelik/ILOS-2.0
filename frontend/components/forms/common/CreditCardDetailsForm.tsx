"use client";
import React from 'react';
import { useCustomer } from '@/contexts/CustomerContext';

/**
 * CreditCardDetailsForm - Credit Card specific information
 * Used by Platinum and Classic credit card applications
 * 
 * Sections:
 * 1. Card Details (type, name on card, destination)
 * 2. Next of Kin (emergency contact)
 * 3. Card Preferences (statement delivery, SMS alerts, Credit Guardian)
 * 4. Supplementary Cards
 */

interface CreditCardDetailsFormProps {
  /** Section number for sequential forms */
  sectionNumber?: number;
  /** Card type for context */
  cardType?: 'PLATINUM' | 'CLASSIC';
}

export const CreditCardDetailsForm: React.FC<CreditCardDetailsFormProps> = ({
  sectionNumber,
  cardType = 'PLATINUM'
}) => {
  const { customerData, updateCustomerData } = useCustomer();

  const creditCardDetails = customerData?.creditCardDetails || {};
  const nextOfKin = customerData?.nextOfKin || {};

  const handleCardDetailsChange = (field: string, value: any) => {
    updateCustomerData({
      creditCardDetails: {
        ...creditCardDetails,
        [field]: value,
      },
    });
  };

  const handleNextOfKinChange = (field: string, value: any) => {
    updateCustomerData({
      nextOfKin: {
        ...nextOfKin,
        [field]: value,
      },
    });
  };

  const sectionHeaderNumber = sectionNumber ? `${sectionNumber}. ` : '';

  return (
    <section className="mb-10">
      <h3 className="text-2xl rounded-lg text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">
        {sectionHeaderNumber}Credit Card Details
      </h3>

      <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="text-sm text-purple-800">
          <strong>💳 {cardType} Card:</strong> You're applying for a UBL {cardType} Credit Card. 
          Please provide accurate information for faster processing.
        </div>
      </div>

      {/* ==================== SECTION 1: CARD DETAILS ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">💳 Card Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Name on Card */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Name on Card *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Full Name (as it should appear on card)" 
              value={creditCardDetails.nameOnCard || ""}
              onChange={(e) => handleCardDetailsChange('nameOnCard', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum 19 characters (including spaces)
            </p>
          </div>
          
          {/* Passport Number (Optional) */}
          <div>
            <label className="block mb-2 font-medium">Passport Number</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Passport No. (Optional)" 
              value={creditCardDetails.passportNumber || ""}
              onChange={(e) => handleCardDetailsChange('passportNumber', e.target.value)}
            />
          </div>
          
          {/* Card Destination */}
          <div>
            <label className="block mb-2 font-medium">Card Destination *</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="cardDestination" 
                  value="Home"
                  checked={creditCardDetails.cardDestination === 'Home'}
                  onChange={(e) => handleCardDetailsChange('cardDestination', e.target.value)}
                /> 
                Home Address
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="cardDestination" 
                  value="Office"
                  checked={creditCardDetails.cardDestination === 'Office'}
                  onChange={(e) => handleCardDetailsChange('cardDestination', e.target.value)}
                /> 
                Office Address
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="cardDestination" 
                  value="Branch"
                  checked={creditCardDetails.cardDestination === 'Branch'}
                  onChange={(e) => handleCardDetailsChange('cardDestination', e.target.value)}
                /> 
                UBL Branch
              </label>
            </div>
          </div>
          
          {/* Statement Delivery */}
          <div>
            <label className="block mb-2 font-medium">Statement Delivery *</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="statementDelivery" 
                  value="Email"
                  checked={creditCardDetails.statementDelivery === 'Email'}
                  onChange={(e) => handleCardDetailsChange('statementDelivery', e.target.value)}
                /> 
                Email (e-Statement)
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="statementDelivery" 
                  value="Postal"
                  checked={creditCardDetails.statementDelivery === 'Postal'}
                  onChange={(e) => handleCardDetailsChange('statementDelivery', e.target.value)}
                /> 
                Postal Mail
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="statementDelivery" 
                  value="Both"
                  checked={creditCardDetails.statementDelivery === 'Both'}
                  onChange={(e) => handleCardDetailsChange('statementDelivery', e.target.value)}
                /> 
                Both
              </label>
            </div>
          </div>
          
          {/* e-Statement Email (if email selected) */}
          {(creditCardDetails.statementDelivery === 'Email' || creditCardDetails.statementDelivery === 'Both') && (
            <div>
              <label className="block mb-2 font-medium">e-Statement Email *</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
                placeholder="email@example.com" 
                value={creditCardDetails.estatementEmail || ""}
                onChange={(e) => handleCardDetailsChange('estatementEmail', e.target.value)}
              />
            </div>
          )}
          
          {/* Payment Option */}
          <div>
            <label className="block mb-2 font-medium">Payment Option *</label>
            <select 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              value={creditCardDetails.paymentOption || ""}
              onChange={(e) => handleCardDetailsChange('paymentOption', e.target.value)}
            >
              <option value="">Select Payment Method</option>
              <option value="Auto Debit">Auto Debit from UBL Account</option>
              <option value="Manual">Manual Payment</option>
              <option value="Standing Instruction">Standing Instruction</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: NEXT OF KIN ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">👤 Next of Kin (Emergency Contact)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* Next of Kin Name */}
          <div>
            <label className="block mb-2 font-medium">Full Name *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Next of Kin Name" 
              value={nextOfKin.name || ""}
              onChange={(e) => handleNextOfKinChange('name', e.target.value)}
            />
          </div>
          
          {/* Relationship */}
          <div>
            <label className="block mb-2 font-medium">Relationship *</label>
            <select 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              value={nextOfKin.relationship || ""}
              onChange={(e) => handleNextOfKinChange('relationship', e.target.value)}
            >
              <option value="">Select Relationship</option>
              <option value="Spouse">Spouse</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Contact Number 1 */}
          <div>
            <label className="block mb-2 font-medium">Contact Number 1 *</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Primary Contact" 
              value={nextOfKin.contactNumber1 || ""}
              onChange={(e) => handleNextOfKinChange('contactNumber1', e.target.value)}
            />
          </div>
          
          {/* Contact Number 2 */}
          <div>
            <label className="block mb-2 font-medium">Contact Number 2</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Secondary Contact (Optional)" 
              value={nextOfKin.contactNumber2 || ""}
              onChange={(e) => handleNextOfKinChange('contactNumber2', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== SECTION 3: CARD PREFERENCES & SERVICES ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">⚙️ Card Preferences & Services</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          {/* SMS Alert Service */}
          <div>
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1"
                checked={creditCardDetails.availSmsAlert || false}
                onChange={(e) => handleCardDetailsChange('availSmsAlert', e.target.checked)}
              />
              <div>
                <span className="font-medium">📱 SMS Alert Service</span>
                <p className="text-sm text-gray-600">
                  Receive transaction alerts via SMS for enhanced security
                </p>
              </div>
            </label>
          </div>
          
          {/* Credit Guardian */}
          <div>
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1"
                checked={creditCardDetails.availCreditGuardian || false}
                onChange={(e) => handleCardDetailsChange('availCreditGuardian', e.target.checked)}
              />
              <div>
                <span className="font-medium">🛡️ Credit Guardian</span>
                <p className="text-sm text-gray-600">
                  Insurance coverage against outstanding balance in case of unforeseen events
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 4: SUPPLEMENTARY CARDS (Optional) ==================== */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">👥 Supplementary Cards (Optional)</h4>
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
          
          <label className="flex items-center gap-3 mb-4">
            <input 
              type="checkbox" 
              checked={creditCardDetails.requestSupplementaryCard || false}
              onChange={(e) => handleCardDetailsChange('requestSupplementaryCard', e.target.checked)}
            />
            <span className="font-medium">I would like to request supplementary card(s)</span>
          </label>
          
          {creditCardDetails.requestSupplementaryCard && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-white rounded-lg">
              <div>
                <label className="block mb-2 font-medium text-sm">Card Holder Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                  placeholder="Name on Card" 
                  value={creditCardDetails.supplementaryCardName || ""}
                  onChange={(e) => handleCardDetailsChange('supplementaryCardName', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm">Relationship</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                  value={creditCardDetails.supplementaryCardRelation || ""}
                  onChange={(e) => handleCardDetailsChange('supplementaryCardRelation', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm">CNIC</label>
                <input 
                  type="text" 
                  maxLength={15}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                  placeholder="XXXXX-XXXXXXX-X" 
                  value={creditCardDetails.supplementaryCardCnic || ""}
                  onChange={(e) => handleCardDetailsChange('supplementaryCardCnic', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 md:col-span-3">
                Additional supplementary cards can be added after account activation
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="text-sm text-purple-800">
          <strong>💡 Benefits:</strong> Your {cardType} Card comes with exclusive rewards, cashback offers, 
          airport lounge access, and comprehensive insurance coverage. View full benefits at ubl.com.pk
        </div>
      </div>
    </section>
  );
};


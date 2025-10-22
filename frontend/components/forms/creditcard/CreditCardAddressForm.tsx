"use client";
import React, { useEffect, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";

// Helper for highlight classes
const getFieldClasses = (field: string, prefilled: Set<string>) =>
  `w-full rounded-xl border border-gray-300 px-4 py-2 ${
    prefilled.has(field) ? "bg-yellow-50 border-yellow-300" : "bg-white"
  }`;

export const CreditCardAddressForm = () => {
  const { customerData, updateCustomerData } = useCustomer();

  // Extract address data from backend
  const postal = customerData?.cifData?.postal || {};
  const email = customerData?.cifData?.email || {};
  const phone = customerData?.cifData?.phone || {};
  const individualInfo = customerData?.cifData?.individualInfo || {};
  
  // Get existing data from context
  const addressDetails = customerData?.addressDetails || {};
  const currentAddress = addressDetails.currentAddress || {};
  const permanentAddress = addressDetails.permanentAddress || {};
  const personalDetails = customerData?.personalDetails || {};
  const creditCard = customerData?.creditCard || {};

  // Default state
  const [formData, setFormData] = useState({
    houseApt: currentAddress.houseNo || "",
    street: currentAddress.street || "",
    tehsil: currentAddress.tehsil || "",
    landmark: currentAddress.nearestLandmark || "",
    city: currentAddress.city || "",
    postalCode: currentAddress.postalCode || "",
    telephoneRes: currentAddress.telephone || "",
    mobile: currentAddress.mobile || personalDetails.mobileNumber || "",
    ntn: personalDetails.ntn || "",
    residenceType: creditCard.typeOfResidence || "",
    natureOfResidence: currentAddress.residentialStatus || "",
    residingSince: currentAddress.yearsAtAddress || "",
    email: currentAddress.email || personalDetails.email || "",
    // Permanent
    pStreet: permanentAddress.street || "",
    pTehsil: permanentAddress.tehsil || "",
    pLandmark: permanentAddress.nearestLandmark || "",
    pCity: permanentAddress.city || "",
    pPostalCode: permanentAddress.postalCode || "",
    // Car
    carYear: creditCard.carYear || "",
    carModel: creditCard.carModel || "",
    carReg: creditCard.carRegistrationNo || "",
    carOwnership: creditCard.carOwnership || "",
  });
  console.log("Initial Form Data==>:", customerData?.cifData?.dirDetails.ntn);

  // Track which fields are prefilled
  const [prefilled, setPrefilled] = useState<Set<string>>(new Set());

  useEffect(() => {
    const pf = new Set<string>();
    const f = { ...formData };

    // --- CURRENT ADDRESS ---
    // Try to parse house/apt/street from postal.address if it looks like comma separated
    if (postal.address) {
      // Example: "VPO THANA MOH:BADAM BAGHCHA TEH:BATKHELA MALAKAND THANA"
      const addressParts = postal.address.split(",");
      if (addressParts.length >= 2) {
        f.houseApt = addressParts[0]?.trim();
        f.street = addressParts[1]?.trim();
        pf.add("houseApt");
        pf.add("street");
      } else {
        // Fallback, put all in street
        f.street = postal.address;
        pf.add("street");
      }
    }
    if (postal.tehsil) { f.tehsil = postal.tehsil; pf.add("tehsil"); }
    if (customerData?.cifData.city || individualInfo.city) {
      f.city = customerData?.cifData.city || individualInfo.city; pf.add("city");
    }
    if (postal.postal_code) { f.postalCode = postal.postal_code; pf.add("postalCode"); }
    if (postal.landmark) { f.landmark = postal.landmark; pf.add("landmark"); }
    if (phone.phone_no) { f.telephoneRes = phone.phone_no; pf.add("telephoneRes"); }
    if (customerData?.cifData?.mobile) { f.mobile = customerData.cifData.mobile; pf.add("mobile"); }
    // Mobile fallback: try phone.phone_no if not set
    if (!f.mobile && phone.phone_no) { f.mobile = phone.phone_no; pf.add("mobile"); }
    if (customerData?.cifData?.dirDetails.ntn) { f.ntn = customerData.cifData.dirDetails.ntn; pf.add("ntn"); }
    if (email.address) { f.email = email.address; pf.add("email"); }
    // TODO: ResidenceType/NatureOfResidence/ResidingSince if available

    // --- PERMANENT ADDRESS ---
    // If you have a separate permanent address key, use it here. For demo, we copy from postal.
    if (postal.permanent_street) { f.pStreet = postal.permanent_street; pf.add("pStreet"); }
    if (postal.permanent_tehsil) { f.pTehsil = postal.permanent_tehsil; pf.add("pTehsil"); }
    if (postal.permanent_landmark) { f.pLandmark = postal.permanent_landmark; pf.add("pLandmark"); }
    if (customerData?.cifData?.city) { f.pCity = customerData.cifData.city; pf.add("City"); }
    if (postal.permanent_postal_code) { f.pPostalCode = postal.permanent_postal_code; pf.add("pPostalCode"); }

    setFormData(f);
    setPrefilled(pf);
    // eslint-disable-next-line
  }, [customerData]);

  // Handler for controlled fields
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update context based on field
    switch (field) {
      case 'houseApt':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              houseNo: value
            }
          }
        });
        break;
      case 'street':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              street: value
            }
          }
        });
        break;
      case 'tehsil':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              tehsil: value,
              area: value
            }
          }
        });
        break;
      case 'landmark':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              nearestLandmark: value
            }
          }
        });
        break;
      case 'city':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              city: value
            }
          }
        });
        break;
      case 'postalCode':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              postalCode: value
            }
          }
        });
        break;
      case 'telephoneRes':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              telephone: value
            }
          }
        });
        break;
      case 'mobile':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              mobile: value
            }
          },
          personalDetails: {
            ...personalDetails,
            mobileNumber: value
          }
        });
        break;
      case 'ntn':
        updateCustomerData({
          personalDetails: {
            ...personalDetails,
            ntn: value
          }
        });
        break;
      case 'residenceType':
        updateCustomerData({
          creditCard: {
            ...creditCard,
            typeOfResidence: value
          }
        });
        break;
      case 'natureOfResidence':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              residentialStatus: value
            }
          }
        });
        break;
      case 'residingSince':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              yearsAtAddress: value
            }
          }
        });
        break;
      case 'email':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            currentAddress: {
              ...currentAddress,
              email: value
            }
          },
          personalDetails: {
            ...personalDetails,
            email: value
          }
        });
        break;
      // Permanent address
      case 'pStreet':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            permanentAddress: {
              ...permanentAddress,
              street: value
            }
          }
        });
        break;
      case 'pTehsil':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            permanentAddress: {
              ...permanentAddress,
              tehsil: value,
              area: value
            }
          }
        });
        break;
      case 'pLandmark':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            permanentAddress: {
              ...permanentAddress,
              nearestLandmark: value
            }
          }
        });
        break;
      case 'pCity':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            permanentAddress: {
              ...permanentAddress,
              city: value
            }
          }
        });
        break;
      case 'pPostalCode':
        updateCustomerData({
          addressDetails: {
            ...addressDetails,
            permanentAddress: {
              ...permanentAddress,
              postalCode: value
            }
          }
        });
        break;
      // Car details
      case 'carYear':
        updateCustomerData({
          creditCard: {
            ...creditCard,
            carYear: value
          }
        });
        break;
      case 'carModel':
        updateCustomerData({
          creditCard: {
            ...creditCard,
            carModel: value
          }
        });
        break;
      case 'carReg':
        updateCustomerData({
          creditCard: {
            ...creditCard,
            carRegistrationNo: value
          }
        });
        break;
      case 'carOwnership':
        updateCustomerData({
          creditCard: {
            ...creditCard,
            carOwnership: value
          }
        });
        break;
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl text-white font-semibold mb-4 p-4 bg-primary text-primary-foreground">4. Address Details (CBS)</h3>
      {/* A. Current Residential Address */}
      <div>
        <h4 className="text-2xl rounded-lg font-bold text-primary mb-6">A. Current Residential Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">House/Apt</label>
            <input
              type="text"
              className={getFieldClasses("houseApt", prefilled)}
              value={formData.houseApt}
              placeholder="House/Apt"
              onChange={e => handleChange("houseApt", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <input
              type="text"
              className={getFieldClasses("street", prefilled)}
              value={formData.street}
              placeholder="Street"
              onChange={e => handleChange("street", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tehsil / District</label>
            <input
              type="text"
              className={getFieldClasses("tehsil", prefilled)}
              value={formData.tehsil}
              placeholder="Tehsil / District"
              onChange={e => handleChange("tehsil", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nearest Landmark</label>
            <input
              type="text"
              className={getFieldClasses("landmark", prefilled)}
              value={formData.landmark}
              placeholder="Nearest Landmark"
              onChange={e => handleChange("landmark", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              className={getFieldClasses("city", prefilled)}
              value={formData.city}
              placeholder="City"
              onChange={e => handleChange("city", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Postal Code</label>
            <input
              type="text"
              className={getFieldClasses("postalCode", prefilled)}
              value={formData.postalCode}
              placeholder="Postal Code"
              onChange={e => handleChange("postalCode", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telephone (Res)</label>
            <input
              type="text"
              className={getFieldClasses("telephoneRes", prefilled)}
              value={formData.telephoneRes}
              placeholder="Telephone (Res)"
              onChange={e => handleChange("telephoneRes", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile</label>
            <input
              type="text"
              className={getFieldClasses("mobile", prefilled)}
              value={formData.mobile}
              placeholder="Mobile"
              onChange={e => handleChange("mobile", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NTN</label>
            <input
              type="text"
              className={getFieldClasses("ntn", prefilled)}
              value={formData.ntn}
              placeholder="NTN"
              onChange={e => handleChange("ntn", e.target.value)}
            />
          </div>
          {/* Residence/Nature checkboxes could be mapped if backend provides this data */}
          <div>
            <label className="block text-sm font-medium mb-1">Type of Residence</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.residenceType === "House"} onChange={() => handleChange("residenceType", "House")} />
                House
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.residenceType === "Apartment"} onChange={() => handleChange("residenceType", "Apartment")} />
                Apartment
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nature of Residence</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {["Owned", "Rented", "Parents", "Mortgaged", "Company Property"].map(option => (
                <label key={option} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.natureOfResidence === option} onChange={() => handleChange("natureOfResidence", option)} />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Residing Since</label>
            <input
              type="text"
              className={getFieldClasses("residingSince", prefilled)}
              value={formData.residingSince}
              placeholder="Residing Since"
              onChange={e => handleChange("residingSince", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className={getFieldClasses("email", prefilled)}
              value={formData.email}
              placeholder="Email"
              onChange={e => handleChange("email", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* B. Permanent Address */}
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-primary mb-6">B. Permanent Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <input
              type="text"
              className={getFieldClasses("pStreet", prefilled)}
              value={formData.pStreet}
              placeholder="Street"
              onChange={e => handleChange("pStreet", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tehsil / District</label>
            <input
              type="text"
              className={getFieldClasses("pTehsil", prefilled)}
              value={formData.pTehsil}
              placeholder="Tehsil / District"
              onChange={e => handleChange("pTehsil", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nearest Landmark</label>
            <input
              type="text"
              className={getFieldClasses("pLandmark", prefilled)}
              value={formData.pLandmark}
              placeholder="Nearest Landmark"
              onChange={e => handleChange("pLandmark", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              className={getFieldClasses("pCity", prefilled)}
              value={formData.pCity}
              placeholder="City"
              onChange={e => handleChange("pCity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Postal Code</label>
            <input
              type="text"
              className={getFieldClasses("pPostalCode", prefilled)}
              value={formData.pPostalCode}
              placeholder="Postal Code"
              onChange={e => handleChange("pPostalCode", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Car Details (left blank - can be attached if you get backend car info) */}
      <div className="mt-10">
        <h4 className="text-base font-semibold mb-2">Car Details (If Applicable)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">Car Year</label>
            <input type="number" className={getFieldClasses("carYear", prefilled)} value={formData.carYear} onChange={e => handleChange("carYear", e.target.value)} placeholder="Year" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input type="text" className={getFieldClasses("carModel", prefilled)} value={formData.carModel} onChange={e => handleChange("carModel", e.target.value)} placeholder="Model" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Registration #</label>
            <input type="text" className={getFieldClasses("carReg", prefilled)} value={formData.carReg} onChange={e => handleChange("carReg", e.target.value)} placeholder="Registration #" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">Ownership</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {["Owned", "Leased", "Company", "N/A"].map(option => (
                <label key={option} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.carOwnership === option} onChange={() => handleChange("carOwnership", option)} />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

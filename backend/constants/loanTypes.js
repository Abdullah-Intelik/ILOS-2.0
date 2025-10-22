// Canonical mapping for application types and child table names

const ApplicationType = {
  CashPlus: 'CashPlus',
  AutoLoan: 'AutoLoan',
  SMEASAAN: 'SMEASAAN',
  CommercialVehicle: 'CommercialVehicle',
  AmeenDrive: 'AmeenDrive',
  PlatinumCreditCard: 'PlatinumCreditCard',
  ClassicCreditCard: 'ClassicCreditCard',
};

// Child table names used consistently in ilos_applications.loan_type
const ChildTableName = {
  cashplus: 'cashplus_applications',
  autoloan: 'autoloan_applications',
  smeasaan: 'smeasaan_applications',
  commercialvehicle: 'commercial_vehicle_applications',
  ameendrive: 'ameendrive_applications',
  platinum: 'platinum_card_applications',
  creditcard: 'creditcard_applications',
};

function applicationTypeToChildTable(applicationType) {
  switch (applicationType) {
    case ApplicationType.CashPlus:
      return ChildTableName.cashplus;
    case ApplicationType.AutoLoan:
      return ChildTableName.autoloan;
    case ApplicationType.SMEASAAN:
      return ChildTableName.smeasaan;
    case ApplicationType.CommercialVehicle:
      return ChildTableName.commercialvehicle;
    case ApplicationType.AmeenDrive:
      return ChildTableName.ameendrive;
    case ApplicationType.PlatinumCreditCard:
      return ChildTableName.platinum;
    case ApplicationType.ClassicCreditCard:
      return ChildTableName.creditcard;
    default:
      return null;
  }
}

module.exports = {
  ApplicationType,
  ChildTableName,
  applicationTypeToChildTable,
};



export const ROLES = [
  // Super Admin role
  {
    role: "biztrack-admin",
    options: [
      { value: "biztrack-admin", label: "Super Admin" },
      { value: "hotel-admin", label: "Hotel Admin" },
      { value: "kiosk-admin", label: "Kiosk Admin" },
      { value: "hospital-admin", label: "Hospital Admin" },
    ],
    optionsCreate: [
      { value: "hotel-admin", label: "Hotel Admin" },
      { value: "kiosk-admin", label: "Kiosk Admin" },
      { value: "hospital-admin", label: "Hospital Admin" },
    ],
  },

  // Hotel Admin role
  {
    role: "hotel-admin",
    options: [
      { value: "hotel-admin", label: "Hotel Admin" },
      { value: "hotel-cashier", label: "Cashier" },
      { value: "hotel-waiter", label: "Waiter" },
    ],
    optionsCreate: [
      { value: "hotel-cashier", label: "Cashier" },
      { value: "hotel-waiter", label: "Waiter" },
    ],
  },

  // Kiosk Admin role
  {
    role: "kiosk-admin",
    options: [
      { value: "kiosk-admin", label: "Kiosk Admin" },
      { value: "kiosk-shopkeeper", label: "Shopkeeper" },
    ],
    optionsCreate: [
      { value: "kiosk-shopkeeper", label: "Shopkeeper" },
    ],
  },

  // Hospital Admin role
  {
    role: "hospital-admin",
    options: [
      { value: "hospital-admin", label: "Hospital Admin" },
      { value: "hospital-receptionist", label: "Receptionist" },
      { value: "hospital-doctor", label: "Doctor" },
      { value: "hospital-nurse", label: "Nurse" },
      { value: "hospital-pharmacist", label: "Pharmacist" },
      { value: "hospital-labtechnician", label: "Lab Technician" },
    ],
    optionsCreate: [
      { value: "hospital-receptionist", label: "Receptionist" },
      { value: "hospital-doctor", label: "Doctor" },
      { value: "hospital-nurse", label: "Nurse" },
      { value: "hospital-pharmacist", label: "Pharmacist" },
      { value: "hospital-labtechnician", label: "Lab Technician" },
    ],
  },

  // Individual roles (optional for clarity)
  {
    role: "hotel-cashier",
    options: [{ value: "hotel-cashier", label: "Cashier" }],
    optionsCreate: [{ value: "hotel-cashier", label: "Cashier" }],
  },
  {
    role: "hotel-waiter",
    options: [{ value: "hotel-waiter", label: "Waiter" }],
    optionsCreate: [{ value: "hotel-waiter", label: "Waiter" }],
  },
  {
    role: "kiosk-shopkeeper",
    options: [{ value: "kiosk-shopkeeper", label: "Shopkeeper" }],
    optionsCreate: [{ value: "kiosk-shopkeeper", label: "Shopkeeper" }],
  },
  {
    role: "hospital-receptionist",
    options: [{ value: "hospital-receptionist", label: "Receptionist" }],
    optionsCreate: [{ value: "hospital-receptionist", label: "Receptionist" }],
  },
  {
    role: "hospital-doctor",
    options: [{ value: "hospital-doctor", label: "Doctor" }],
    optionsCreate: [{ value: "hospital-doctor", label: "Doctor" }],
  },
  {
    role: "hospital-nurse",
    options: [{ value: "hospital-nurse", label: "Nurse" }],
    optionsCreate: [{ value: "hospital-nurse", label: "Nurse" }],
  },
  {
    role: "hospital-pharmacist",
    options: [{ value: "hospital-pharmacist", label: "Pharmacist" }],
    optionsCreate: [{ value: "hospital-pharmacist", label: "Pharmacist" }],
  },
  {
    role: "hospital-labtechnician",
    options: [{ value: "hospital-labtechnician", label: "Lab Technician" }],
    optionsCreate: [{ value: "hospital-labtechnician", label: "Lab Technician" }],
  },

  // All roles (for global dropdowns, if needed)
  {
    role: "all",
    options: [
      { value: "biztrack-admin", label: "Super Admin" },
      { value: "hotel-admin", label: "Hotel Admin" },
      { value: "hotel-cashier", label: "Cashier" },
      { value: "hotel-waiter", label: "Waiter" },
      { value: "kiosk-admin", label: "Kiosk Admin" },
      { value: "kiosk-shopkeeper", label: "Shopkeeper" },
      { value: "hospital-admin", label: "Hospital Admin" },
      { value: "hospital-receptionist", label: "Receptionist" },
      { value: "hospital-doctor", label: "Doctor" },
      { value: "hospital-nurse", label: "Nurse" },
      { value: "hospital-pharmacist", label: "Pharmacist" },
      { value: "hospital-labtechnician", label: "Lab Technician" },
    ],
  },
];

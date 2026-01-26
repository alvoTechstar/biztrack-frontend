import Biztracklogo from "../assets/Logos/biztrack-logo.png"; 
import hotellogo from "../assets/Logos/cbl.png";
import KioskLogo from "../assets/Logos/ria.png";
import Hospital from "../assets/Logos/isw.png";

export const mockBusinesses = [
  {
    id: 'biz-super-admin-default', // Special ID for Biztrack Admin default theme
    name: 'Biztrack Central',
    type: 'Platform',
    logoUrl:  Biztracklogo, 
    primaryColor: '#118eed', 
  },
  {
    id: 'biz-hotel-grandhyatt',
    name: 'Grand Hyatt Nairobi',
    type: 'Hotel',
    logoUrl:  hotellogo,
    primaryColor: '#0056b3', // Darker Blue for Hotel
  },
  {
    id: 'biz-kiosk-quickeats',
    name: 'Quick Eats Kiosk',
    type: 'Kiosk',
    logoUrl: KioskLogo,
    primaryColor: '#28a745', // Green for Kiosk
  },
  {
    id: 'biz-hospital-citycare',
    name: 'City Care Hospital',
    type: 'Hospital',
    logoUrl:  Hospital,
    primaryColor: '#d9a109', // Red for Hospital
  },
];

export const MockUsers = [
  {
    id: 'user-biztrack-admin',
    email: "admin@biztrack.com",
    password: "Admin123!",
    role: "Biztrack_ADMIN",
    name: "Alvo Tech",
    phoneNumber: "0711000001",
    associatedBusinessId: 'biz-super-admin-default' // Linked to the default Biztrack theme
  },
  {
    id: 'user-hotel-admin',
    email: "hoteladmin@biztrack.com",
    password: "Hotel123!",
    role: "Hotel_Admin",
    name: "Ian",
    phoneNumber: "0711000002",
    associatedBusinessId: 'biz-hotel-grandhyatt' // Linked to Grand Hyatt
  },
  {
    id: 'user-cashier',
    email: "cashier@biztrack.com",
    password: "Cashier123!",
    role: "Hotel_Cashier",
    name: "Mwangi Kim",
    phoneNumber: "0711000003",
    associatedBusinessId: 'biz-hotel-grandhyatt' // Same business as Hotel Admin
  },
  {
    id: 'user-kiosk-admin',
    email: "kioskadmin@biztrack.com",
    password: "Kiosk123!",
    role: "Kiosk_Admin",
    name: "Jane  Doe",
    phoneNumber: "0711000004",
    associatedBusinessId: 'biz-kiosk-quickeats' // Linked to Quick Eats
  },
  {
    id: 'user-shopkeeper',
    email: "shopkeeper@biztrack.com",
    password: "Shopkeeper123!",
    role: "Kiosk_Shopkeeper",
    name: "Kibet Brian",
    phoneNumber: "0711000005",
    associatedBusinessId: 'biz-kiosk-quickeats' // Same business as Kiosk Admin
  },
  {
    id: 'user-waiter',
    email: "waiter@biztrack.com",
    password: "Waiter123!",
    role: "Hotel_Waiter",
    name: "Mike Wako",
    phoneNumber: "0711000006",
    associatedBusinessId: 'biz-hotel-grandhyatt' // Same business as Hotel Admin
  },
  // Hospital Users
  {
    id: 'user-hospital-admin',
    email: "hospitaladmin@biztrack.com",
    password: "Hospital123!",
    role: "Hospital_Admin",
    name: "Alvin smith",
    phoneNumber: "0711000007",
    associatedBusinessId: 'biz-hospital-citycare' // Linked to City Care
  },
  {
    id: 'user-receptionist',
    email: "receptionist@biztrack.com",
    password: "Reception123!",
    role: "Hospital_Receptionist",
    name: "Alvin Kim",
    phoneNumber: "0711000008",
    associatedBusinessId: 'biz-hospital-citycare'
  },
  {
    id: 'user-doctor',
    email: "doctor@biztrack.com",
    password: "Doctor123!",
    role: "Hospital_Doctor",
    name: "John Doe",
    phoneNumber: "0711000009",
    associatedBusinessId: 'biz-hospital-citycare'
  },
  {
    id: 'user-nurse',
    email: "nurse@biztrack.com",
    password: "Nurse123!",
    role: "Hospital_Nurse",
    name: "Sharon Mwangi",
    phoneNumber: "0711000010",
    associatedBusinessId: 'biz-hospital-citycare'
  },
  {
    id: 'user-pharmacist',
    email: "pharmacist@biztrack.com",
    password: "Pharmacist123!",
    role: "Hospital_Pharmacist",
    name: "Tonny Wako ",
    phoneNumber: "0711000011",
    associatedBusinessId: 'biz-hospital-citycare'
  },
  {
    id: 'user-labtech',
    email: "labtech@biztrack.com",
    password: "Labtech123!",
    role: "Hospital_LabTechnician",
    name: "Kim Adan",
    phoneNumber: "0711000012",
    associatedBusinessId: 'biz-hospital-citycare'
  }
];
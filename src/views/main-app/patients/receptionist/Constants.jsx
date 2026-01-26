// src/constants.js

import { v4 as uuidv4 } from "uuid";

export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
export const VISIT_TYPES_QUEUE = [
  "Consultation",
  "Lab Test",
  "Pharmacy Pickup",
  "Procedure",
  "Check-up",
  "Emergency",
];
export const STATUS_OPTIONS = {
  WAITING: "Waiting",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  CANCELLED: "Cancelled",
};
export const SEARCH_BY_PHONE = "Phone Number";
export const SEARCH_BY_ID = "National ID";

export const initialPatientsData = [
  {
    id: uuidv4(),
    fullName: "Diana Prince",
    phoneNumber: "0719515125",
    nationalId: "39204861",
    gender: "Female",
    dob: new Date(1985, 2, 22),
    address: "1 Paradise Island",
  },
  {
    id: uuidv4(),
    fullName: "Clark Kent",
    phoneNumber: "0712345678",
    nationalId: "12345678",
    gender: "Male",
    dob: new Date(1980, 5, 18),
    address: "Apt 5, Metropolis",
  },
  {
    id: uuidv4(),
    fullName: "Bruce Wayne",
    phoneNumber: "0773095474",
    nationalId: "39204870",
    gender: "Male",
    dob: new Date(1975, 3, 17),
    address: "Wayne Manor, Gotham",
  },
];
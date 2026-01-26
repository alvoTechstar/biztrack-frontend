import React from "react";
import * as yup from "yup";
import JSEncrypt from "jsencrypt";
import moment from "moment";
import { returnStatusResponse } from "../services/LocalStorageService";
import { v4 as uuid } from "uuid";
import { jwtDecode } from "jwt-decode"; // Correct named import
import { NumericFormat } from "react-number-format";
import { isValidPhoneNumber } from "libphonenumber-js";

// Accepted Card Patterns
export const ACCEPTED_CARDS = [
  { name: "visa", pattern: /^4[0-9]{12}(?:[0-9]{3})?$/ },
  { name: "mastercard", pattern: /^5[1-5][0-9]{14}$/ },
  { name: "verve", pattern: /^50[0-9]{14}$/ },
  { name: "unionpay", pattern: /^62[0-9]{14,17}$/ },
];

// Card Number Validation
export const cardNumberValidation = yup
  .string()
  .transform((value) => value.replace(/[^\d]/g, ""))
  .required("Please enter your card number")
  .matches(/^[0-9]{16}$|^[0-9]{19}$/, "The card number must be 16 or 19 digits long")
  .test("valid-card-type", "Invalid card number", (value) =>
    ACCEPTED_CARDS.some((card) => card.pattern.test(value))
  );

// Expiry Date Validation
export const expiryValidation = yup
  .string()
  .required("Enter the card's expiry")
  .length(5, "Should be exactly 5 characters long")
  .test("format", "Invalid date format", (value) => /^(0\d|1[0-2])\/\d{2}$/.test(value))
  .test("not-expired", "Card has expired", (value) => {
    if (!value) return false;
    const [month, year] = value.split("/");
    const now = new Date();
    const expiryDate = new Date(parseInt(`20${year}`), parseInt(month) - 1, 1);
    return expiryDate >= new Date(now.getFullYear(), now.getMonth(), 1);
  });

// CVV Validation
export const cvvValidation = yup
  .string()
  .required("Please enter the card's CVV")
  .matches(/^\d{3}$/, "The CVV must be exactly 3 digits");

// Email Validation
export const validateEmail = (email) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(String(email).toLowerCase());

export const getEncryptValue = (password) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(returnStatusResponse().value);
  return encryptor.encrypt(password.replace(/\s/g, ""));
};

// Phone Number Validation
export const validatePhoneNumber = (phone) =>
  /^(254|0)([7]\d|[1][0-1]){1}\d{1}\d{6}$/.test(phone);

// Password Validation
export const validatePassword = (test, password) => {
  const tests = {
    length: password.length >= 7,
    characters: /[^A-z\s\d][\\^]?/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d+/.test(password),
  };

  return test in tests ? tests[test] : /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/.test(password);
};

// Role Normalization
export const normalizeRole = (role) => {
  if (!role) return "";

  const roleString = String(role);

  const roleMap = {
    "Super_Admin": "Super Admin",   
    "Hotel_Admin": "Hotel Admin",
    "Hotel_Cashier": "Cashier",
    "Hotel_Waiter": "Waiter",
    "Kiosk_Admin": "Kiosk Admin",
    "Kiosk_Shopkeeper": "Shopkeeper",
    "Hospital_Admin": "Hospital Admin",
    "Hospital_Receptionist": "Receptionist",
    "Hospital_Doctor": "Doctor",
    "Hospital_Nurse": "Nurse",
    "Hospital_Pharmacist": "Pharmacist",
    "Hospital_LabTechnician": "Lab Technician",

  };

  return roleMap[roleString] || roleString;
};

export const generateUUID = () => uuid();

export const validatePhoneNumberInternational = (value, country) => {
  const sanitizedValue = value.replace(/[\s\-]/g, "");
  return sanitizedValue && country ? isValidPhoneNumber(sanitizedValue, country) : false;
};

export const validateKEPassport = (id) => /^[A-Z0-9]{7,9}$/.test(id);
export const validateKEID = (id) => /^[0-9]{8}$/.test(id);

// Fixed - remove the wrapper function since we're importing jwtDecode directly
// You can use jwtDecode directly in your components

// String Formatting Functions
export const formatPill = (str) => str ? capitalize(str.replace("_", " ")) : str;

export const formatPillOutbound = (str) => {
  const statusMap = {
    "ApprovalPending": "Pending",
    "Pending Approval": "Pending",
    "Draft/Pending Approval": "Pending",
    "ReadyForPayout": "Ready",
    "Sent": "Sent",
    "Processing": "Processing",
    "Draft": "Draft",
  };
  return statusMap[str] || str;
};

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;

export const initials = (str) =>
  str.toLowerCase().split(".").map(part => part.charAt(0).toUpperCase()).join("");

export const initialsCaps = (str) =>
  str.split(" ").map(part => part.charAt(0).toUpperCase()).join("");

export const roleFormat = (str) =>
  str.toLowerCase().split("_").map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(" ");

export const getUsername = (str) => str.substring(0, str.indexOf("@"));

export const getInitials = (firstName, lastName) => {
  if (!firstName) return "";
  const firstInitial = firstName.charAt(0);
  const lastInitial = lastName ? lastName.charAt(0) : "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Date Formatting Functions
export const formatDate = (date) => date ? moment(date).format("DD/MM/YY") : null;
export const formatDateForm = (date) => date ? moment(date).format("YYYY-MM-DD") : null;
export const formatDateLogs = (date) => date ? moment(date).format("DD/MM/YY hh:mm:ss a") : null;
export const formatDateLogsModal = (date) => date ? moment(date).format("DD-MMM-YY | hh:mm:ss a") : null;

export const formatPhoneNumber = (phonenumber) => {
  // Handle null, undefined, empty strings
  if (!phonenumber) return "N/A";

  // Convert to string and remove any whitespace
  const phoneString = String(phonenumber).trim();

  // If it's empty after trimming, return N/A
  if (!phoneString) return "N/A";

  // Handle the phone number formatting
  if (phoneString.startsWith("254")) {
    return `0${phoneString.slice(3)}`;
  } else if (phoneString.startsWith("+254")) {
    return `0${phoneString.slice(4)}`;
  }

  // Return the original string if it doesn't match expected formats
  return phoneString;
};

export const formatAmount = (amount) => (
  <NumericFormat
    value={amount}
    displayType={"text"}
    thousandSeparator={true}
    prefix={"KES "}
  />
);

export const formatValue = (str) => {
  if (typeof str !== "string") return str;

  if (str.includes("Pay")) return "Pay";
  if (str.includes("Search")) return "Search";
  if (str.includes("_")) return formatString(str);

  return str;
};

export const formatString = (str) => {
  if (!str) return "";

  const words = str.split("_");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  }

  if (words.length >= 2) {
    const [firstWord, secondWord] = words;
    const formattedSecondWord = secondWord.length > 3
      ? secondWord.charAt(0).toUpperCase() + secondWord.slice(1).toLowerCase()
      : secondWord.toUpperCase();

    return `${firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()} ${formattedSecondWord}`;
  }

  return str;
};

export const removeSubstring = (str) => camelCaseToSpace(str.replace(/Isw|Ria/g, ""));
export const camelCaseToSpace = (str) => str.replace(/([a-z])([A-Z])/g, "$1 $2");

// Search and Filter Functions
export const searchObject = (obj, searchKey) =>
  Object.keys(obj).some(key =>
    obj[key].toString().toLowerCase().includes(searchKey.toLowerCase())
  );

export const searchFunction = (arr, searchKey) => {
  if (!searchKey || !arr) return arr;

  return arr.filter(obj =>
    Object.keys(obj).some(key =>
      typeof obj[key] === "object"
        ? searchObject(obj[key], searchKey)
        : obj[key].toString().toLowerCase().includes(searchKey.toLowerCase())
    )
  );
};

export const sortArray = (arr, column) =>
  [...arr].sort((a, b) => new Date(b[column]) - new Date(a[column]));

export const filterArray = (arr, key, value) => arr.filter(obj => obj[key] === value);

export const getValues = (obj, key, title) => {
  const dataKey = key.split(".");

  if (dataKey.length === 1) return obj[key];

  const firstLevel = obj[dataKey[0]];
  if (!firstLevel) return "";

  if (dataKey.length === 2) {
    if (key.includes("Name") && !key.includes("userName") && title !== "Transaction" && !key.includes("institution")) {
      return firstLevel.firstName
        ? `${firstLevel.firstName} ${firstLevel.middleName || firstLevel.thirdName || firstLevel.lastName || ""}`
        : "";
    }
    return firstLevel[dataKey[1]] || "";
  }

  if (dataKey.length === 3) {
    return firstLevel[dataKey[1]]?.[dataKey[2]] || "";
  }

  return "";
};

export const getRowValue = (arr, index, key) => {
  const item = arr.find(value => value.id === index);
  return key ? item?.[key] : item;
};

export const getSelectArray = (arr, label, value, optional) =>
  arr ? arr.map(element => ({
    label: element[label],
    value: element[value],
    ...(optional && { optional: element[optional] })
  })) : [];

export const getCustomArray = (arr) => arr.slice(0, -1);

export const getDateRange = (range) => ({
  startDate: moment().subtract(range, "days").format("DD-MM-YYYY"),
  endDate: moment().format("DD-MM-YYYY")
});

export const formatBene = (str) =>
  str.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").replace("Bene", "Beneficiary");

export const getFilteredTable = (data, arr, arr2, columns, type) => {
  if (!data) return [];

  return data.filter(item => {
    const columnValue = columns[0] === "institution"
      ? type === "logs"
        ? item.actionBy?.institution?.institutionName
        : item[columns[0]]?.institutionName
      : item[columns[0]];

    const hasFirstFilter = arr.length === 0 || arr.includes(columnValue);
    const hasSecondFilter = !arr2 || arr2.length === 0 || arr2.includes(item[columns[1]]);

    return hasFirstFilter && hasSecondFilter;
  });
};

export const getCustomOptionsArray = (arr, arr2, col, col2) => {
  if (!arr2) return arr;

  return arr.filter(item =>
    arr2.some(item2 => item[col] === item2[col2])
  );
};

export const getFilters = (arr) => arr.join(", ");

export const formatPaidDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(/,/, '');
};

// Export jwtDecode directly for use in other components
export { jwtDecode };

export const formatCurrency = (amount) => `KSh ${amount?.toLocaleString() || "0"}`;

export const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper for shortened items display
export const renderShortenedItems = (items) => {
  if (!items || items.length === 0) return "No items";

  const firstItem = items[0];
  const remainingCount = items.length - 1;
  const itemName = firstItem.name || firstItem.product?.name || "Unknown Product";
  const quantity = firstItem.quantity || 1;

  return (
    <div className="flex flex-col gap-0">
      <div className="text-sm">
        {quantity}x {itemName.length > 20 ? itemName.substring(0, 20) + '...' : itemName}
      </div>
      {remainingCount > 0 && (
        <div className="text-xs text-gray-500">
          +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
// Add this function inside your SalesReport component, before the return statement
export const renderTransactionItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <span className="text-gray-500">No items</span>;
  }
  
  const productList = items.map(item => ({
    name: item.productName || item.name || "Unknown Product",
    quantity: item.quantity || 1
  }));
  
  if (productList.length === 1) {
    const item = productList[0];
    return (
      <span className="font-medium">
        {item.name} ({item.quantity}x)
      </span>
    );
  }
  
  return (
    <div className="flex flex-col gap-1">
      {productList.slice(0, 2).map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <span className="text-xs font-medium truncate max-w-[100px]">
            {item.name}
          </span>
          <span className="text-xs text-gray-500">({item.quantity}x)</span>
        </div>
      ))}
      {productList.length > 2 && (
        <span className="text-xs text-gray-500">
          +{productList.length - 2} more items
        </span>
      )}
    </div>
  );
};
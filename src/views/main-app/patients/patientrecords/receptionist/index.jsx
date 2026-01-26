import React, { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import PatientModal from "../../../../../components/modal/PatientModal";
import AppFormButton from "../../../../../components/buttons/AppFormButton";
import SearchInput from "../../../../../components/input/SearchInput";
import DataTable from "../../../../../components/DataTable";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import SelectInput from "../../../../../components/input/SelectInput";
import PatientRegistration from "../../../patients/receptionist/PatientRegistration";

const ReceptionistPatientRecordsPage = ({ user }) => {
  const initialPatients = [
    {
      id: "p1",
      fullName: "John Doe",
      nationalId: "12345678",
      phone: "0712345678",
      isMinor: false,
      guardianName: "",
      guardianNationalId: "",
      createdBy: "hospitaladmin@biztrack.com",
      dob: "1985-01-15",
      gender: "Male",
      address: "123 Main St",
      visitType: "Consultation",
    },
    {
      id: "p2",
      fullName: "Mary Smith",
      nationalId: "87654321",
      phone: "0723456789",
      isMinor: false,
      guardianName: "",
      guardianNationalId: "",
      createdBy: "hospitaladmin@biztrack.com",
      dob: "1990-05-20",
      gender: "Female",
      address: "456 Oak Ave",
      visitType: "Follow-up",
    },
    {
      id: "p3",
      fullName: "Emma Wilson",
      nationalId: "",
      phone: "0734567890",
      isMinor: true,
      guardianName: "Sarah Wilson",
      guardianNationalId: "11223344",
      createdBy: "receptionist@biztrack.com",
      dob: "2015-08-10",
      gender: "Female",
      address: "789 Pine Rd",
      visitType: "Vaccination",
    },
    {
      id: "p4",
      fullName: "Michael Brown",
      nationalId: "98765432",
      phone: "0745678901",
      isMinor: false,
      guardianName: "",
      guardianNationalId: "",
      createdBy: "receptionist@biztrack.com",
      dob: "1978-11-03",
      gender: "Male",
      address: "101 Maple St",
      visitType: "Consultation",
    },
    {
      id: "p5",
      fullName: "Olivia Davis",
      nationalId: "",
      phone: "0756789012",
      isMinor: true,
      guardianName: "David Davis",
      guardianNationalId: "55443322",
      createdBy: "receptionist@biztrack.com",
      dob: "2010-03-25",
      gender: "Female",
      address: "202 Birch Ave",
      visitType: "Check-up",
    },
  ];

  const [patients, setPatients] = useState(initialPatients);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false); // New state for registration modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const { primaryColor: PrimaryColor } = useTheme();

  useEffect(() => {
    let filtered = [...patients];

    if (user && user.email) {
      filtered = filtered.filter((p) => p.createdBy === user.email);
    } else {
      filtered = [];
      console.warn(
        "User or user.email is undefined, cannot filter by createdBy. Showing no records."
      );
    }

    if (filterType === "minors") {
      filtered = filtered.filter((p) => p.isMinor);
    } else if (filterType === "adults") {
      filtered = filtered.filter((p) => !p.isMinor);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(term) ||
          p.phone.includes(term) ||
          (p.nationalId && p.nationalId.includes(term)) ||
          (p.guardianName && p.guardianName.toLowerCase().includes(term))
      );
    }

    setFilteredPatients(filtered);
  }, [patients, user, filterType, searchTerm]);

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = parseISO(dob);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setEditFormData({ ...patient });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? editFormData : p))
    );
    setEditModalOpen(false);
    setSelectedPatient(null);
    setEditFormData({});
  };

  const handleRegisterPatient = (newPatientData) => {
    const newPatient = {
      id: `p${patients.length + 1}`, // Simple ID generation
      fullName: newPatientData.fullName,
      nationalId: newPatientData.nationalId,
      phone: newPatientData.phoneNumber,
      isMinor: false, // You might need logic here to determine if minor
      guardianName: "",
      guardianNationalId: "",
      createdBy: user ? user.email : "unknown",
      dob: newPatientData.dob,
      gender: newPatientData.gender,
      address: newPatientData.address,
      visitType: newPatientData.visitType,
    };

    setPatients((prev) => [...prev, newPatient]);
  };

  const canEditField = (fieldName) => fieldName === "phone";

  const columns = [
    {
      label: "Patient",
      field: "fullName",
      render: (patient) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {patient.fullName}
          </span>
          {patient.isMinor && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Minor
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Age",
      field: "dob",
      render: (patient) => calculateAge(patient.dob),
    },
    {
      label: "National ID",
      field: "nationalId",
      render: (patient) => (patient.isMinor ? "N/A" : patient.nationalId),
    },
    { label: "Phone", field: "phone" },
    { label: "Visit Type", field: "visitType" },
    {
      label: "Actions",
      isActionColumn: true,
      render: (patient) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(patient)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
            title="View"
          >
            👁️
          </button>
          <button
            onClick={() => handleEdit(patient)}
            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
            title="Edit"
          >
            ✏️
          </button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    { value: "all", label: "select" },
    { value: "adults", label: "Adults Only" },
    { value: "minors", label: "Minors Only" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-sm md:text-sm lg:text-2xl">
            Receptionist - Patient Records
          </h1>
          <div className="flex flex-col sm:flex-row gap-7 w-full md:w-auto items-center">
            <div className="w-full sm:w-[35%]">
              <SearchInput
                input={searchTerm}
                handleInput={(e) => setSearchTerm(e.target.value)}
                handleClear={() => setSearchTerm("")}
                placeholder="Search patients..."
                id="patient-search"
              />
            </div>

            <div className="w-full mt-3 sm:w-auto">
              <SelectInput
                id="filter-type"
                name="filterType"
                options={filterOptions}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value.value)}
              />
            </div>

            <div className=" p-3 sm:w-auto">
              <AppFormButton
                action={() => {
                  setRegisterModalOpen(true);
                }}
                text="Register Patient"
                icon={<AddIcon fontSize="small" />}
                color={PrimaryColor}
                validation={true}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPatients}
        title="Patient List"
      />

      {/* View Modal */}
      <PatientModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Patient Details"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <p className="text-gray-900">{selectedPatient.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {selectedPatient.isMinor
                  ? "Minor (No National ID)"
                  : "National ID"}
              </label>
              <p className="text-gray-900">
                {selectedPatient.isMinor ? "N/A" : selectedPatient.nationalId}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <p className="text-gray-900">{selectedPatient.phone}</p>
            </div>
            {selectedPatient.isMinor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Guardian Name
                  </label>
                  <p className="text-gray-900">
                    {selectedPatient.guardianName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Guardian National ID
                  </label>
                  <p className="text-gray-900">
                    {selectedPatient.guardianNationalId}
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end pt-4">
              <AppFormButton
                action={() => setViewModalOpen(false)}
                text="Close"
                color="rgb(107, 114, 128)"
              />
            </div>
          </div>
        )}
      </PatientModal>

      {/* Edit Modal */}
      <PatientModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Patient"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              As a receptionist, you can only edit the phone number.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editFormData.fullName || ""}
                disabled={!canEditField("fullName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.isMinor || false}
                  disabled={!canEditField("isMinor")}
                  className="rounded disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Minor
                </span>
              </label>
            </div>
            {!editFormData.isMinor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID
                </label>
                <input
                  type="text"
                  value={editFormData.nationalId || ""}
                  disabled={!canEditField("nationalId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={editFormData.phone || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                disabled={!canEditField("phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            {editFormData.isMinor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.guardianName || ""}
                    disabled={!canEditField("guardianName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian National ID
                  </label>
                  <input
                    type="text"
                    value={editFormData.guardianNationalId || ""}
                    disabled={!canEditField("guardianNationalId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <AppFormButton
                action={() => setEditModalOpen(false)}
                text="Cancel"
                color="rgb(107, 114, 128)"
              />
              <AppFormButton
                action={handleSaveEdit}
                text="Save Changes"
                color={PrimaryColor}
              />
            </div>
          </div>
        )}
      </PatientModal>

      {/* Patient Registration Modal */}
      <PatientRegistration
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onRegisterPatient={handleRegisterPatient}
        patients={patients} // Pass existing patients for validation
      />
    </div>
  );
};

export default ReceptionistPatientRecordsPage;

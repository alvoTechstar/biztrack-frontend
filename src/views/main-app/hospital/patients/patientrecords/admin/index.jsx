import React, { useState, useMemo } from "react";
import { parseISO } from "date-fns";
import PatientModal from "../../../../../../components/modal/PatientModal";
import DataTable from "../../../../../../components/datatable";

// Import Material-UI icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminPatientRecordsPage = () => {
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
  ];

  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = () => {
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? editFormData : p))
    );
    setEditModalOpen(false);
    setSelectedPatient(null);
    setEditFormData({});
  };

  const handleConfirmDelete = () => {
    setPatients((prev) => prev.filter((p) => p.id !== selectedPatient.id));
    setDeleteModalOpen(false);
    setSelectedPatient(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value) => {
    setFilterType(value);
  };

  const handleDataTableAction = (actionKey, row) => {
    switch (actionKey) {
      case "view":
        handleView(row);
        break;
      case "edit":
        handleEdit(row);
        break;
      case "delete":
        handleDelete(row);
        break;
      default:
        break;
    }
  };

  const patientColumns = useMemo(
    () => [
      {
        field: "fullName",
        label: "Patient",
        render: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {row.fullName}
            </span>
            {row.isMinor && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Minor
              </span>
            )}
          </div>
        ),
      },
      {
        field: "dob",
        label: "Age",
        render: (row) => calculateAge(row.dob),
      },
      {
        field: "nationalId",
        label: "National ID",
        render: (row) => (row.isMinor ? "N/A" : row.nationalId),
      },
      { field: "phone", label: "Phone" },
      { field: "visitType", label: "Visit Type" },
      { field: "createdBy", label: "Created By" },
      {
        field: "actions",
        label: "Actions",
        isActionColumn: true,
      },
    ],
    []
  );

  const filterOptions = useMemo(
    () => [
      { value: "all", label: "All Patients" },
      { value: "adults", label: "Adults Only" },
      { value: "minors", label: "Minors Only" },
    ],
    []
  );

  const dataForDataTable = useMemo(() => {
    if (filterType === "minors") {
      return patients.filter((p) => p.isMinor);
    } else if (filterType === "adults") {
      return patients.filter((p) => !p.isMinor);
    }
    return patients;
  }, [patients, filterType]);

  // UPDATED: Use Material-UI Icon Components directly in customActionConfigs
  const customActionConfigs = {
    view: {
      icon: VisibilityIcon, // Pass the component itself
      tooltip: "View",
      // className: removed, as TableAction will handle global styling
    },
    edit: {
      icon: EditIcon, // Pass the component itself
      tooltip: "Edit",
      // className: removed
    },
    delete: {
      icon: DeleteIcon, // Pass the component itself
      tooltip: "Delete",
      // className: removed
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        title="Patient Records (Admin)"
        columns={patientColumns}
        data={dataForDataTable}
        showToolbar={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterOptions={filterOptions}
        filterValue={filterType}
        onFilterChange={handleFilterChange}
        onAction={handleDataTableAction}
        statusActionMap={{
          default: ["view", "edit", "delete"],
        }}
        customActionConfigs={customActionConfigs}
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
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Created By
              </label>
              <p className="text-gray-900">{selectedPatient.createdBy}</p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editFormData.fullName || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.isMinor || false}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      isMinor: e.target.checked,
                    }))
                  }
                  className="rounded"
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
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      nationalId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        guardianName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian National ID
                  </label>
                  <input
                    type="text"
                    value={editFormData.guardianNationalId || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        guardianNationalId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </PatientModal>

      {/* Delete Confirmation Modal */}
      <PatientModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        {selectedPatient && (
          <div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the patient record for{" "}
              <strong>{selectedPatient.fullName}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </PatientModal>
    </div>
  );
};

export default AdminPatientRecordsPage;
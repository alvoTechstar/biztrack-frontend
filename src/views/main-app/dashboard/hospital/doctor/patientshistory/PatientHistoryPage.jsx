import React from "react";
import {
  ArrowBack,
  CheckCircle,
  Science,
  LocalHospital,
  CalendarToday, // <--- THIS IS THE MISSING IMPORT!
  Error,
  Healing,
} from "@mui/icons-material";

// --- Import useTheme from your components ---
import { useTheme } from "../../../../../../components/theme/ThemeContext";

// --- Comprehensive Mock Data for ALL Patient Histories ---
// (No changes to mock data for this iteration)
const allPatientConsultationHistoryData = [
  {
    id: "PAT-001",
    name: "Aisha Hassan",
    age: 42,
    gender: "Female",
    dob: "1982-07-01",
    contact: "+254 7XX XXX XXX",
    allergies: ["Penicillin", "Dust Mites"],
    chronicConditions: ["Type 2 Diabetes", "Hypertension"],
    pastMedicalHistory: [
      { date: "2015-03-10", condition: "Appendectomy" },
      { date: "2005-09-20", condition: "Measles" },
    ],
    consultations: [
      {
        id: "CONS-005",
        date: "2025-06-28 10:30 AM",
        doctor: "Dr. Jane Smith",
        chiefComplaint: "Persistent headache and fatigue",
        status: "Consultation Completed",
        notes:
          "Patient presented with headache for 3 days, accompanied by general fatigue. No fever. BP 130/85, Temp 37.2°C.",
        diagnosis: "Tension Headache",
        prescriptions: [
          {
            medication: "Paracetamol",
            dosage: "500mg",
            frequency: "TID",
            duration: "3 days",
          },
          {
            medication: "Multivitamin",
            dosage: "1 tablet",
            frequency: "OD",
            duration: "30 days",
          },
        ],
        requestedLabTests: ["Full Blood Count"],
        submittedLabResults: [
          {
            testName: "Full Blood Count",
            value: "Normal",
            unit: "",
            status: "Normal",
            notes: "All parameters within normal range.",
          },
        ],
        referralDepartment: "Pharmacy",
        followUp: "Review in 1 week if symptoms persist.",
      },
      {
        id: "CONS-004",
        date: "2025-06-25 02:00 PM",
        doctor: "Dr. Jane Smith",
        chiefComplaint: "Routine check-up; Diabetes review",
        status: "Awaiting Lab Results",
        notes:
          "Patient for routine diabetes check. Stable, no new complaints. Current medication adherence good.",
        diagnosis: "Type 2 Diabetes Mellitus (Controlled)",
        prescriptions: [
          {
            medication: "Metformin",
            dosage: "500mg",
            frequency: "BD",
            duration: "90 days",
          },
        ],
        requestedLabTests: ["HbA1c", "Fasting Blood Sugar", "Lipid Profile"],
        submittedLabResults: [],
        referralDepartment: "Lab",
        followUp: "Await lab results, then schedule follow-up.",
      },
    ],
  },
  {
    id: "PAT-002",
    name: "John Doe",
    age: 30,
    gender: "Male",
    dob: "1995-01-15",
    contact: "+254 7XX XXX XXX",
    allergies: ["None"],
    chronicConditions: [],
    pastMedicalHistory: [],
    consultations: [
      {
        id: "CONS-003-JD",
        date: "2025-06-01 09:00 AM",
        doctor: "Dr. Alice Brown",
        chiefComplaint: "Common Cold symptoms",
        status: "Consultation Completed",
        notes:
          "Patient presented with runny nose, cough, and sore throat. Symptoms for 2 days. Advised rest and fluids.",
        diagnosis: "Acute Viral Rhinitis",
        prescriptions: [
          {
            medication: "Pain Reliever",
            dosage: "1 tablet",
            frequency: "TID",
            duration: "5 days",
          },
        ],
        requestedLabTests: [],
        submittedLabResults: [],
        referralDepartment: "Pharmacy",
        followUp: "No follow-up needed.",
      },
    ],
  },
  {
    id: "PAT-003",
    name: "Sarah Conners",
    age: 55,
    gender: "Female",
    dob: "1970-03-20",
    contact: "+254 7XX XXX XXX",
    allergies: ["Aspirin"],
    chronicConditions: ["Osteoarthritis"],
    pastMedicalHistory: [
      { date: "2010-08-01", condition: "Knee Replacement (Left)" },
    ],
    consultations: [
      {
        id: "CONS-006-SC",
        date: "2025-06-10 11:00 AM",
        doctor: "Dr. John Doe",
        chiefComplaint: "Knee pain flare-up",
        status: "Consultation Completed",
        notes:
          "Patient experienced increased pain in left knee. Assessed range of motion. Recommended physiotherapy.",
        diagnosis: "Osteoarthritis Exacerbation",
        prescriptions: [
          {
            medication: "Ibuprofen",
            dosage: "400mg",
            frequency: "BD",
            duration: "7 days",
          },
        ],
        requestedLabTests: [],
        submittedLabResults: [],
        referralDepartment: "Physiotherapy",
        followUp: "Follow up with Physio in 2 weeks.",
      },
    ],
  },
];

const PatientHistoryPage = ({ patientId, onBackToList }) => {
  // --- Get your theme's primary color ---
  const { PrimaryColor } = useTheme();

  const patientHistory = allPatientConsultationHistoryData.find(
    (p) => p.id === patientId
  );

  const getStatusBadge = (status) => {
    // Tailwind's `bg-opacity-20` can create a lighter shade of the primary color for a background
    const primaryBgLight = PrimaryColor
      ? `bg-[${PrimaryColor}] bg-opacity-20`
      : "bg-blue-100";
    const primaryText = PrimaryColor
      ? `text-[${PrimaryColor}]`
      : "text-blue-800";

    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

    switch (status) {
      case "Consultation Completed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Completed
          </span>
        );
      case "Awaiting Lab Results":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Science className="mr-1 h-4 w-4" />
            Awaiting Results
          </span>
        );
      case "Referred to Nurse":
        return (
          <span className={`${baseClasses} ${primaryBgLight} ${primaryText}`}>
            <LocalHospital className="mr-1 h-4 w-4" />
            Referred
          </span>
        );
      case "Canceled":
      case "Did Not Attend":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <Error className="mr-1 h-4 w-4" />
            {status}
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  if (!patientHistory) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={onBackToList}
          // Use PrimaryColor for the back button
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          style={{ color: PrimaryColor || "#2563eb" }} // Fallback if PrimaryColor isn't defined
        >
          <ArrowBack className="mr-2" />
          Back to Patient List
        </button>

        <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Patient History Not Found
          </h2>
          <p className="text-gray-600">
            The history for the selected patient could not be loaded. Please try
            again or select another patient.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Back Button */}
      <button
        onClick={onBackToList}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition duration-200"
        style={{ color: PrimaryColor || "#2563eb" }}
      >
        <ArrowBack className="mr-2" />
        Back to Patient List
      </button>

      {/* Patient Header */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">
              {patientHistory.name}
            </h1>
            <div className="mt-2 text-gray-600">
              <span className="font-medium">ID:</span> {patientHistory.id} |{" "}
              <span className="font-medium">Age:</span> {patientHistory.age} |{" "}
              <span className="font-medium">Gender:</span>{" "}
              {patientHistory.gender} |{" "}
              <span className="font-medium">DOB:</span> {patientHistory.dob}
            </div>
          </div>

          <div className="md:text-right">
            <h3
              className="text-lg font-medium"
              style={{ color: PrimaryColor || "#2563eb" }}
            >
              Medical Alerts
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 justify-start md:justify-end">
              {patientHistory.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  Allergy: {allergy}
                </span>
              ))}
              {patientHistory.chronicConditions.map((condition, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  Chronic: {condition}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Past Medical History */}
      {patientHistory.pastMedicalHistory.length > 0 && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2
            className="mb-4 flex items-center text-xl font-bold"
            style={{ color: PrimaryColor || "#2563eb" }}
          >
            <Healing className="mr-2" />
            Past Medical History
          </h2>
          <ul className="divide-y divide-gray-200">
            {patientHistory.pastMedicalHistory.map((item, index) => (
              <li key={index} className="py-3">
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-gray-500">{item.date}:</span>{" "}
                      {item.condition}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Consultations */}
      <h2
        className="mb-4 flex items-center text-xl font-bold"
        style={{ color: PrimaryColor || "#2563eb" }}
      >
        <CalendarToday className="mr-2" />
        Consultation History
      </h2>

      {patientHistory.consultations.length === 0 ? (
        <p className="text-gray-500">
          No past consultations found for this patient.
        </p>
      ) : (
        <div className="space-y-4">
          {patientHistory.consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="rounded-xl bg-white shadow-sm overflow-hidden"
            >
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {consultation.date} - {consultation.doctor}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">Chief Complaint:</span>{" "}
                      {consultation.chiefComplaint}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {getStatusBadge(consultation.status)}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform duration-200"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </summary>
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      {/* Use PrimaryColor for sub-headings */}
                      <h4
                        className="text-md font-medium mb-2"
                        style={{ color: PrimaryColor || "#2563eb" }}
                      >
                        Details
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Notes:</span>{" "}
                        {consultation.notes}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Diagnosis:</span>{" "}
                        {consultation.diagnosis}
                      </p>
                    </div>

                    {consultation.prescriptions.length > 0 && (
                      <div>
                        <h4
                          className="text-md font-medium mb-2"
                          style={{ color: PrimaryColor || "#2563eb" }}
                        >
                          Prescriptions
                        </h4>
                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                          {consultation.prescriptions.map((p, i) => (
                            <li key={i} className="px-4 py-2">
                              <p className="text-sm">
                                <span className="font-medium">
                                  {p.medication}
                                </span>{" "}
                                - {p.dosage} {p.frequency} ({p.duration})
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {consultation.requestedLabTests.length > 0 && (
                      <div>
                        <h4
                          className="text-md font-medium mb-2"
                          style={{ color: PrimaryColor || "#2563eb" }}
                        >
                          Lab Tests
                        </h4>
                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                          {consultation.requestedLabTests.map((testName, i) => {
                            const submittedResult =
                              consultation.submittedLabResults.find(
                                (res) => res.testName === testName
                              );
                            return (
                              <li key={i} className="px-4 py-2">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {testName}:
                                  </span>{" "}
                                  {submittedResult ? (
                                    <span>
                                      {submittedResult.value}{" "}
                                      {submittedResult.unit} (
                                      {submittedResult.status})
                                      {submittedResult.notes &&
                                        ` - ${submittedResult.notes}`}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">
                                      (Pending)
                                    </span>
                                  )}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {consultation.referralDepartment && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Referred To:</span>{" "}
                        <span style={{ color: PrimaryColor || "#2563eb" }}>
                          {consultation.referralDepartment}
                        </span>
                      </p>
                    )}

                    {consultation.followUp && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Follow-up:</span>{" "}
                        {consultation.followUp}
                      </p>
                    )}
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistoryPage;

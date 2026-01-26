// src/ReceptionistQueuePage.jsx

import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { Container, Paper, Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { v4 as uuidv4 } from "uuid";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

import ReceptionHeader from "./ReceptionHeader";
import NewQueue from "./NewQueue";
import PatientRegistration from "./PatientRegistration";
import QueueDataTable from "./QueueDataTable";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { STATUS_OPTIONS, initialPatientsData } from "./Constants";

// Define main content views
const MAIN_VIEW = {
  QUEUE_TABLE: "queueTable",
  NO_QUEUE_MESSAGE: "noQueueMessage",
  ADD_NEW_QUEUE_PANEL: "addNewQueuePanel",
  REGISTER_PATIENT_PANEL: "registerPatientPanel",
};

const ReceptionistQueuePage = () => {
  const [currentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState(initialPatientsData || []);
  const [nextQueueNumber, setNextQueueNumber] = useState(1);

  const [activeMainView, setActiveMainView] = useState(
    MAIN_VIEW.NO_QUEUE_MESSAGE
  );

  // Use a ref to capture the height of the header, if needed for positioning
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0); // State to store header height

  useEffect(() => {
    // Measure header height after render
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [activeMainView]); // Re-measure if main view changes (panel opens/closes)


  useEffect(() => {
    if (
      activeMainView !== MAIN_VIEW.ADD_NEW_QUEUE_PANEL &&
      activeMainView !== MAIN_VIEW.REGISTER_PATIENT_PANEL
    ) {
      if (queue.length > 0) {
        setActiveMainView(MAIN_VIEW.QUEUE_TABLE);
      } else {
        setActiveMainView(MAIN_VIEW.NO_QUEUE_MESSAGE);
      }
    }
  }, [queue, activeMainView]);

  const handleAddExistingPatientToQueue = (patient, visitType) => {
    const newQueueEntry = {
      queueNumber: nextQueueNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientIdentifier: patient.phoneNumber,
      visitType: visitType,
      arrivalTime: new Date(),
      status: STATUS_OPTIONS.WAITING,
      id: uuidv4(),
    };
    setQueue((prevQueue) => [...prevQueue, newQueueEntry]);
    setNextQueueNumber((prev) => prev + 1);
    handleCloseNewQueuePanel();
  };

  const handleRegisterAndAddToQueue = (registrationData) => {
    const newPatientId = uuidv4();
    const newPatient = {
      id: newPatientId,
      fullName: registrationData.fullName.trim(),
      phoneNumber: registrationData.phoneNumber.trim(),
      nationalId: registrationData.nationalId.trim(),
      gender: registrationData.gender,
      dob: registrationData.dob,
      address: registrationData.address.trim(),
    };
    setPatients((prevPatients) => [...prevPatients, newPatient]);

    const newQueueEntry = {
      queueNumber: nextQueueNumber,
      patientId: newPatientId,
      patientName: newPatient.fullName,
      patientIdentifier: newPatient.phoneNumber,
      visitType: registrationData.visitTypeModal,
      arrivalTime: new Date(),
      status: STATUS_OPTIONS.WAITING,
      id: uuidv4(),
    };
    setQueue((prevQueue) => [...prevQueue, newQueueEntry]);
    setNextQueueNumber((prev) => prev + 1);
    handleCloseRegisterPatientPanel();
  };

  const handleUpdateQueueStatus = (queueId, newStatus) => {
    setQueue((prevQueue) =>
      prevQueue.map((item) =>
        item.id === queueId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleOpenNewQueuePanel = () => {
    setActiveMainView(MAIN_VIEW.ADD_NEW_QUEUE_PANEL);
  };

  const handleCloseNewQueuePanel = () => {
    setActiveMainView(null);
  };

  const handleOpenRegisterPatientPanel = () => {
    setActiveMainView(MAIN_VIEW.REGISTER_PATIENT_PANEL);
  };

  const handleCloseRegisterPatientPanel = () => {
    setActiveMainView(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container
        maxWidth="xl"
        className="py-4 md:py-8 bg-gray-50 min-h-screen relative flex flex-col"
      >
        {/* Header Section - Always visible and clickable */}
        <div ref={headerRef} className="mb-4 md:mb-6">
          <ReceptionHeader
            currentDate={currentDate}
            onTogglePanel={handleOpenNewQueuePanel}
          />
        </div>

        {/* This div holds the main content (table or no-queue message) */}
        <div className="flex-1 overflow-y-auto relative">
          {activeMainView === MAIN_VIEW.NO_QUEUE_MESSAGE && (
            <div className="flex items-center justify-center h-full mt-20">
              <Paper
                elevation={4}
                className="p-6 text-center space-y-4 font-sans max-w-sm w-full bg-white rounded-lg shadow-xl"
              >
                <div className="flex justify-center">
                  <ReportProblemOutlinedIcon
                    className="text-yellow-500"
                    style={{ fontSize: "3rem" }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">
                  No Queue Recorded for {currentDate}
                </h3>
                <p className="text-sm text-gray-600">
                  Click the "New Queue Entry" button in the header to start.
                </p>
              </Paper>
            </div>
          )}
          {activeMainView === MAIN_VIEW.QUEUE_TABLE && (
            <QueueDataTable
              queue={queue}
              onUpdateStatus={handleUpdateQueueStatus}
            />
          )}
        </div>

        {/* NewQueue Panel */}
        {activeMainView === MAIN_VIEW.ADD_NEW_QUEUE_PANEL && (
          <NewQueue
            isOpen={true} // Always true when this branch is rendered
            onClose={handleCloseNewQueuePanel}
            patients={patients}
            queue={queue}
            onAddExistingPatientToQueue={handleAddExistingPatientToQueue}
            onOpenRegisterModal={handleOpenRegisterPatientPanel}
            headerHeight={headerHeight} // Pass header height
          />
        )}

        {/* PatientRegistration Panel */}
        {activeMainView === MAIN_VIEW.REGISTER_PATIENT_PANEL && (
          <PatientRegistration
            isOpen={true} // Always true when this branch is rendered
            onClose={handleCloseRegisterPatientPanel}
            onRegisterPatient={handleRegisterAndAddToQueue}
            patients={patients}
            headerHeight={headerHeight} // Pass header height
          />
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default ReceptionistQueuePage;
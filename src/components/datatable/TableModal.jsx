import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import "../../views/MainApp/mainApp.css";
import "./table.css";
import {
  formatDateLogsModal,
  formatString,
  formatValue,
  removeSubstring,
} from "../../utilities/SharedFunctions.jsx";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "6px",
  boxShadow: "0px 4px 12px 0px rgba(0, 0, 0, 0.02)",
  p: 4,
};

export default function TableModal({ color, handleClear, data }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    handleClear();
    setOpen(false);
  };

  useEffect(() => {
    if (data) {
      handleOpen();
    }
  }, [data]);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="display-flex-persist">
            <div>
              <span className="main-form-title">Audit Log</span>
            </div>
            <CancelRoundedIcon
              className="main-form-close"
              style={{ fill: color }}
              onClick={() => handleClose()}
            />
          </div>
          <div className="main-form table-modal">
            <div className="display-flex">
              <div className="main-form-flex-triple">
                <span className="table-modal-title">Timestamp</span>
                <span>
                  {data ? formatDateLogsModal(data.dateCreated) : null}
                </span>
              </div>
              <div className="main-form-flex-triple">
                <span className="table-modal-title">Action</span>
                <span>
                  {data
                    ? data.cashPickUpOrder
                      ? `${formatValue(data.details)}`
                      : formatString(data.action)
                    : null}
                </span>
              </div>
              <div className="main-form-flex-triple">
                <span className="table-modal-title">Feature Type</span>
                <span>{data ? removeSubstring(data.itemName) : null}</span>
              </div>
            </div>
            <hr />
            <div className="display-flex">
              <div className="main-form-flex-triple">
                <span className="table-modal-title">Institution Name</span>
                <span>
                  {data
                    ? `${data.actionBy.institution.institutionName} ${
                        data.actionBy.branch
                          ? `- ${data.actionBy.branch.name}`
                          : ""
                      }`
                    : null}
                </span>
              </div>
              <div className="main-form-flex-triple">
                <span className="table-modal-title">Username</span>
                <span>{data ? data.actionBy.userName : null}</span>
              </div>
              <div className="main-form-flex-triple">
                <span className="table-modal-title">Role</span>
                <span>
                  {data ? formatString(data.actionBy.userRole) : null}
                </span>
              </div>
            </div>
            <hr />
            <div>
              <span className="table-modal-title">Details</span>
              <span>
                {data
                  ? data.cashPickUpOrder
                    ? `${data.details} - PIN: ${
                        data.cashPickUpOrder.pin
                          ? data.cashPickUpOrder.pin
                          : "not captured"
                      }  ${
                        formatValue(data.details) === "Pay"
                          ? data.cashPickUpOrder.beneAmount
                            ? `- KES ${data.cashPickUpOrder.beneAmount}`
                            : "- Amount not captured"
                          : ""
                      }`
                    : data.details
                  : null}{" "}
              </span>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

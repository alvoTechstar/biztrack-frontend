import React from "react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { CircularProgress } from "@mui/material";
import "./loader.css";

export default function ContentLoader({
  state,
  color,
  loading,
  loadingText,
  loadedText,
}) {

  return (
    <div className="content-loader-container">
      {!loading ? (
        <>
          {state === true ? (
            <CheckCircleOutlineRoundedIcon
              className="content-loader-svg"
              style={{ color: color }}
            />
          ) : (
            <ErrorOutlineRoundedIcon
              className="content-loader-svg"
              color="error"
            />
          )}

          <span>{loadedText}</span>
        </>
      ) : (
        <>
          <CircularProgress style={{ color: color }} />
          <span>{loadingText}</span>
        </>
      )}
    </div>
  );
}

import React from "react";
import { Pagination, Stack } from "@mui/material";
import "./table.css";

export default function TablePagination({ color, pages, page, handleChange }) {
  return (
    <Stack spacing={2} className="table-pagination">
      <Pagination
        count={pages}
        page={page}
        color="primary"
        variant="outlined"
        shape="rounded"
        onChange={handleChange}
        showFirstButton
        showLastButton
        sx={{
          "& .Mui-selected": {
            background: `${color} !important`,
            color: "#fff !important",
          },
        }}
      />
    </Stack>
  );
}

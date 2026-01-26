// src/components/KpiCard.jsx
import React from "react";
import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";

const KpiCard = ({ icon, title, value, color, trend = null, onClick }) => {
  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        "&:hover": { boxShadow: onClick ? 6 : 1 },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            {/* Typography variants handle font sizing responsively */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={0.5}>
                {trend.type === "up" ? (
                  <ArrowUpwardIcon fontSize="small" color="success" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" color="error" />
                )}
                <Typography
                  variant="caption" // Caption variant is small, suitable for small text, adjusts responsively
                  color={trend.type === "up" ? "success.main" : "error.main"}
                  ml={0.5}
                >
                  {trend.value}% {trend.type === "up" ? "increase" : "decrease"}
                </Typography>
              </Box>
            )}
          </Box>
          {/* Avatar has fixed size, which is usually fine for icons within a card */}
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;

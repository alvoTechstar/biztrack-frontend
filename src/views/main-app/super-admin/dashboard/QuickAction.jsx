import React from "react";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { AddBusiness, PersonAdd } from "@mui/icons-material";

const QuickActions = () => {
  return (
    <div className="flex justify-end items-center gap-2 mb-6">
      <AppFormButton
        text="Create New Business"
        icon={<AddBusiness fontSize="small" />}
        color="#1976D2" 
        isLoading={false}
        validation={true}
        action={() => console.log("Create New Business")}
      />
      <AppFormButton
        text="Add New User"
        icon={<PersonAdd fontSize="small" />}
        color="#9C27B0" 
        isLoading={false}
        validation={true}
        action={() => console.log("Add New User")}
      />
    </div>
  );
};

export default QuickActions;

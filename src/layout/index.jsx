import React, { useState } from "react";
import Sidebar from "../components/menu";
import Topbar from "../components/header";
import Footer from "../components/footer";
import MyProfile from "../views/main-app/shared/profile";

const MainLayout = ({ children, sidebarOpen, toggleSidebar }) => {
  const [profileViewOpen, setProfileViewOpen] = useState(false);

  const handleOpenProfile = () => setProfileViewOpen(true);
  const handleCloseProfile = () => setProfileViewOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} openProfile={handleOpenProfile} />

        {/* Main content with scrolling that includes footer */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            {/* Content area with bottom padding to account for footer */}
            <div className="flex-1 pb-20">
              {/* Render the profile view or children */}
              {profileViewOpen ? (
                <MyProfile onClose={handleCloseProfile} />
              ) : (
                children
              )}
            </div>

            {/* Footer at the bottom */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
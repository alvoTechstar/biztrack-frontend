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
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Full-width header on top */}
      <Topbar toggleSidebar={toggleSidebar} openProfile={handleOpenProfile} />

      {/* Sidebar + content row below the header */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Main content with scrolling that includes footer */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col">
              {/* Render the profile view or children */}
              <div className="flex-1">
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
    </div>
  );
};

export default MainLayout;
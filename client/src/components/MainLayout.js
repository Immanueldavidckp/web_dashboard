import React from 'react';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';

const MainLayout = ({ children, darkMode, toggleDarkMode, open, handleDrawerOpen, handleDrawerClose }) => {

  return (
    <div style={{ display: 'flex' }}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} handleDrawerOpen={handleDrawerOpen} open={open} />
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} handleDrawerOpen={handleDrawerOpen} />
      <div style={{ flexGrow: 1, padding: '20px', marginTop: '64px' }}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
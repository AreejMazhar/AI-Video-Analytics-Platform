import React from 'react';
import Sidebar from './common/Sidebar';
import Navbar from './common/Navbar';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f5fa' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: '250px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Navbar />
        <main style={{
          padding: '24px',
          flex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
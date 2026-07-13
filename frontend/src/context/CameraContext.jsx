import React, { createContext, useState, useContext } from 'react';

const CameraContext = createContext();

export const useCamera = () => useContext(CameraContext);

export const CameraProvider = ({ children }) => {
  const [cameras, setCameras] = useState([]);

  return (
    <CameraContext.Provider value={{ cameras, setCameras }}>
      {children}
    </CameraContext.Provider>
  );
};
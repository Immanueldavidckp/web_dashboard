import React, { createContext, useReducer } from 'react';
import alertReducer from './reducers/alertReducer';
import { v4 as uuidv4 } from 'uuid';

// Create context
export const AlertContext = createContext();

// Provider component
export const AlertProvider = ({ children }) => {
  const initialState = [];
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Set alert
  const setAlert = (msg, type, timeout = 5000) => {
    const id = uuidv4();
    dispatch({
      type: 'SET_ALERT',
      payload: { msg, type, id }
    });

    setTimeout(() => dispatch({ type: 'REMOVE_ALERT', payload: id }), timeout);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts: state,
        setAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
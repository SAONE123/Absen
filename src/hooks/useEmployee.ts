import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global state variable to sync multiple hook instances
let globalEmployee: any = null;
let listeners: Array<(emp: any) => void> = [];

export const useEmployee = () => {
  const [employee, setEmployeeState] = useState<any>(globalEmployee);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial load
    if (!isReady) {
      loadEmployee();
    }

    // Subscribe to changes
    const listener = (emp: any) => setEmployeeState(emp);
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, [isReady]);

  const loadEmployee = async () => {
    try {
      const data = await AsyncStorage.getItem('logged_employee');
      if (data) {
        const parsed = JSON.parse(data);
        globalEmployee = parsed;
        setEmployeeState(parsed);
      }
    } catch (e) {
      console.error("Failed to load employee session:", e);
    } finally {
      setIsReady(true);
    }
  };

  const notifyListeners = (emp: any) => {
    globalEmployee = emp;
    listeners.forEach(l => l(emp));
  };

  const login = async (data: any) => {
    try {
      await AsyncStorage.setItem('logged_employee', JSON.stringify(data));
      notifyListeners(data);
    } catch (e) {
      console.error("Failed to save employee session:", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('logged_employee');
      notifyListeners(null);
    } catch (e) {
      console.error("Failed to clear employee session:", e);
    }
  };

  return { employee, login, logout, isReady };
};

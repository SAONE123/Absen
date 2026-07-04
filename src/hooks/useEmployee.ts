import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global state variables to sync across multiple hook instances
let globalEmployee: any = null;
let globalAttendance: any = null;
let listeners: Array<(emp: any, att: any) => void> = [];

export const useEmployee = () => {
  const [employee, setEmployeeState] = useState<any>(globalEmployee);
  const [attendance, setAttendanceState] = useState<any>(globalAttendance);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) {
      loadSession();
    }

    // Subscribe to global changes
    const listener = (emp: any, att: any) => {
      setEmployeeState(emp);
      setAttendanceState(att);
    };
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, [isReady]);

  const loadSession = async () => {
    try {
      const empData = await AsyncStorage.getItem('logged_employee');
      if (empData) {
        globalEmployee = JSON.parse(empData);
      }

      const attData = await AsyncStorage.getItem('today_attendance');
      if (attData) {
        globalAttendance = JSON.parse(attData);
      }

      setEmployeeState(globalEmployee);
      setAttendanceState(globalAttendance);
    } catch (e) {
      console.error("Failed to load session:", e);
    } finally {
      setIsReady(true);
    }
  };

  const notifyListeners = (emp: any, att: any) => {
    globalEmployee = emp;
    globalAttendance = att;
    listeners.forEach(l => l(emp, att));
  };

  const login = async (data: any) => {
    try {
      await AsyncStorage.setItem('logged_employee', JSON.stringify(data));
      notifyListeners(data, globalAttendance);
    } catch (e) {
      console.error("Failed to save employee session:", e);
    }
  };

  const updateAttendance = async (data: any) => {
    try {
      globalAttendance = data;
      if (data) {
        await AsyncStorage.setItem('today_attendance', JSON.stringify(data));
      } else {
        await AsyncStorage.removeItem('today_attendance');
      }
      notifyListeners(globalEmployee, data);
    } catch (e) {
      console.error("Failed to update attendance cache:", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      notifyListeners(null, null);
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
  };

  return { employee, attendance, updateAttendance, login, logout, isReady };
};

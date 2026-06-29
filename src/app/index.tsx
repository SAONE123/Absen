import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import AttendanceScreen from '@/components/AttendanceScreen';
import LoginScreen from '@/Material/Login';
import { useEmployee } from '@/hooks/useEmployee';

export default function HomeScreen() {
  const { employee, isReady } = useEmployee();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Jika data karyawan ada di session, tampilkan layar Absen
  // Jika tidak ada, tampilkan layar Login
  return employee ? <AttendanceScreen /> : <LoginScreen />;
}

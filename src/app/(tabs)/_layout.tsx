import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEmployee } from '@/hooks/useEmployee';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const { employee, isReady } = useEmployee();

  // Proteksi Route: Jika belum login, redirect ke login root
  if (isReady && !employee) {
    return <Redirect href="/login_root" />;
  }

  return (
    <Tabs
      initialRouteName="attendance"
      screenOptions={{
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        height: 65,
        paddingBottom: 10,
        paddingTop: 10,
      },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Izin',
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Absen',
          tabBarIcon: ({ color }) => (
            <Ionicons name="finger-print" size={32} color={color} style={{ marginBottom: -3 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="salary"
        options={{
          title: 'Gaji',
          tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}

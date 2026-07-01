import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../firebase/firebaseConfig';
import { useEmployee } from '@/hooks/useEmployee';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useEmployee();

  const handleLogin = async () => {
    if (name.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Mohon isi nama dan password');
      return;
    }

    setLoading(true);
    try {
      console.log(`🔍 Sedang mencari karyawan: "${name.trim()}" di Supabase...`);

      // 1. Cari karyawan berdasarkan nama di tabel employee
      const { data, error } = await supabase
        .from('employee')
        .select('id, name, join_date')
        .eq('name', name.trim())
        .single();

      if (error) {
        console.error("Supabase Query Error:", error);
        Alert.alert('Gagal', 'Karyawan tidak ditemukan atau terjadi kesalahan database');
      } else if (data) {
        console.log("✅ Data ditemukan:", data);

        // 2. Verifikasi Password (Join Date tanpa -)
        const rawJoinDate = data.join_date;
        const cleanJoinDate = rawJoinDate.replace(/-/g, '');

        if (password === cleanJoinDate) {
          // 1. Cek apakah karyawan masih bekerja hari ini (belum absen pulang)
          const todayStr = new Date().toISOString().split('T')[0];
          const { data: attendanceData } = await supabase
            .from('attendance_record')
            .select('id')
            .eq('employee_id', data.id)
            .eq('date', todayStr)
            .is('clock_out_time', null)
            .limit(1);

          // Jika ada baris yang clock_out_time-nya NULL, berarti status masih bekerja (Active)
          const isUserActive = attendanceData && attendanceData.length > 0;

          // 2. Simpan session (termasuk status aktifnya)
          await login({ ...data, isUserActive });
          Alert.alert('Berhasil', `Selamat datang kembali, ${data.name}`);
        } else {
          Alert.alert('Gagal', 'Password (Tanggal Masuk) salah');
        }
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      Alert.alert('Error', `Terjadi kesalahan: ${error.message || 'Koneksi gagal'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.loginBox}>
        {/* Logo Perusahaan */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://thumbs.dreamstime.com/b/print-crash-test-logo-yellow-black-color-vector-illustration-265879701.jpg' }}
            style={styles.logo}
          />
          <Text style={styles.companyName}>PT KAMBING SEJAHTERA UTAMA</Text>
        </View>

        {/* Form Input */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nama Karyawan"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>© 2026 Absen App System</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerText: {
    marginTop: 30,
    fontSize: 12,
    color: '#999',
  },
});

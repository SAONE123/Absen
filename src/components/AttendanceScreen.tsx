import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../firebase/firebaseConfig';
import { useEmployee } from '@/hooks/useEmployee';
import MapComponent from './MapComponent';
import { StatusSlider } from './ui/StatusSlider';

export default function AttendanceScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInside, setIsInside] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const { employee, logout } = useEmployee();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleTakePhoto = () => {
    // Placeholder for camera logic
    Alert.alert(
      "Verifikasi Foto",
      "Gunakan kamera untuk verifikasi?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ambil",
          onPress: () => {
            setHasPhoto(true);
            setPhotoUri('https://i.pravatar.cc/300?u=verified'); // Simulation of captured photo
          }
        }
      ]
    );
  };

  const handleStatusChange = async () => {
    // Gunakan ID dari employee yang sedang login
    const employeeId = employee?.id;
    if (!employeeId) {
      Alert.alert("Error", "Sesi berakhir, silakan login kembali.");
      logout();
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeNowStr = formatTime(new Date());

    try {
      if (isActive) {
        Alert.alert("Konfirmasi", "Apakah Anda ingin pulang?", [
          { text: "Tidak", style: "cancel" },
          {
            text: "Ya",
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('attendance_record')
                  .update({
                    clock_out_time: timeNowStr,
                    status: 'Pulang'
                  })
                  .eq('employee_id', employeeId)
                  .eq('date', todayStr);

                if (error) throw error;

                setIsActive(false);
                setHasPhoto(false);
                setPhotoUri(null);
                Alert.alert("Berhasil", "Absen pulang berhasil dicatat.");
              } catch (error: any) {
                console.error("Supabase Error (OUT):", error);
                Alert.alert("Error", `Gagal simpan data: ${error.message}`);
              }
            }
          }
        ]);
      } else {
        try {
          const { error } = await supabase
            .from('attendance_record')
            .insert({
              employee_id: employeeId,
              date: todayStr,
              clock_in_time: timeNowStr,
              status: 'Mulai Bekerja',
              location_coordinates: userLocation ? `${userLocation.lat}, ${userLocation.lon}` : null,
              verification_image_url: photoUri
            });

          if (error) throw error;

          setIsActive(true);
          Alert.alert("Berhasil", "Absen masuk berhasil dicatat.");
        } catch (error: any) {
          console.error("Supabase Error (IN):", error);
          Alert.alert("Error", `Gagal simpan data: ${error.message}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Employee Photo Section */}
      <View style={styles.profileSection}>
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: 'data:image/jpeg;base64,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' }} // Placeholder photo
            style={styles.profilePhoto}
          />
          {hasPhoto && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          )}
        </View>
        <Text style={styles.employeeName}>{employee?.name || 'Karyawan'}</Text>
        <Text style={styles.clockText}>{formatTime(currentTime)}</Text>
      </View>

      {/* Verification Section */}
      <View style={styles.verificationSection}>
        <TouchableOpacity
          style={[styles.verificationButton, hasPhoto && styles.verifiedButton]}
          onPress={handleTakePhoto}
        >
          <Ionicons
            name="camera"
            size={24}
            color={hasPhoto ? '#4CAF50' : '#2196F3'}
          />
          <Text style={[styles.verificationText, { color: hasPhoto ? '#4CAF50' : '#2196F3' }]}>
            {hasPhoto ? 'Foto Terverifikasi' : 'Ambil Foto'}
          </Text>
        </TouchableOpacity>

        <MapComponent onLocationVerified={(inside, coords) => {
          setIsInside(inside);
          if (coords) setUserLocation(coords);
        }} />

        {hasPhoto && photoUri && (
          <View style={styles.capturedPhotoContainer}>
            <Text style={styles.capturedPhotoTitle}>Foto Terverifikasi:</Text>
            <Image
              source={{ uri: photoUri }}
              style={styles.capturedPhoto}
            />
          </View>
        )}
      </View>

      {/* Slider Section */}
      <View style={styles.footer}>
        <StatusSlider
          onComplete={handleStatusChange}
          isActive={isActive}
          disabled={!hasPhoto || !isInside}
        />
        <Text style={styles.statusLabel}>
          Status: <Text style={{ color: isActive ? '#4CAF50' : '#666' }}>
            {isActive ? 'Bekerja' : 'Belum Mulai'}
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
              { text: "Batal", style: "cancel" },
              { text: "Ya", onPress: () => logout() }
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>© 2026 Absen App System</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#f0f0f0',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  employeeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  clockText: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
    letterSpacing: 1,
  },
  verificationSection: {
    paddingHorizontal: 20,
    gap: 15,
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  verifiedButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    borderStyle: 'solid',
  },
  verificationText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  logoutText: {
    marginLeft: 5,
    color: '#F44336',
    fontWeight: '600',
  },
  footerText: {
    marginTop: 10,
    fontSize: 12,
    color: '#ccc',
  },
  capturedPhotoContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  capturedPhotoTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  capturedPhoto: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../firebase/firebaseConfig';
import { useEmployee } from '@/hooks/useEmployee';
import MapComponent from './MapComponent';
import { StatusSlider } from './ui/StatusSlider';

export default function AttendanceScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInside, setIsInside] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const { employee, attendance, logout, updateAttendance } = useEmployee();

  // Hitung status aktif berdasarkan data absensi global (Sync dengan Home)
  const isActive = !!(attendance?.clock_in_time && !attendance?.clock_out_time);

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

  const handleTakePhoto = async () => {
    try {
      // Minta izin kamera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert("Izin Ditolak", "Aplikasi butuh izin kamera untuk verifikasi absen.");
        return;
      }

      // Buka kamera secara langsung (tanpa opsi galeri)
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Kompres sedikit agar hemat data
      });

      if (!result.canceled) {
        setHasPhoto(true);
        setPhotoUri(result.assets[0].uri);
        console.log("✅ Foto berhasil diambil:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert("Error", "Gagal membuka kamera.");
    }
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

    // Fungsi Helper untuk Upload ke Cloudinary menggunakan FileSystem (Lebih Stabil di Expo)
    const uploadToCloudinary = async (uri: string) => {
      const cloudName = process.env.EXPO_PUBLIC_CLAUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLAUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        console.error("Cloudinary config missing!");
        return uri;
      }

      try {
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const response = await FileSystem.uploadAsync(uploadUrl, uri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType?.MULTIPART || 1, // Fallback ke 1 jika enum tidak terbaca
          fieldName: 'file',
          parameters: {
            'upload_preset': uploadPreset,
          },
        });

        const data = JSON.parse(response.body);

        if (data.error) {
          console.error("Cloudinary Error:", data.error.message);
          return uri;
        }

        return data.secure_url;
      } catch (err) {
        console.error("FileSystem Upload Error:", err);
        return uri;
      }
    };

    try {
      if (isActive) {
        Alert.alert("Konfirmasi", "Apakah Anda ingin pulang?", [
          { text: "Tidak", style: "cancel" },
          {
            text: "Ya",
            onPress: async () => {
              try {
                // CARI baris aktif hari ini milik karyawan ini yang clock_out_time nya masih kosong (null atau string kosong)
                // Ini akan mencocokkan baris yang dibuat oleh aplikasi maupun oleh TRIGGER SQL Anda
                const { data: records, error: fetchError } = await supabase
                  .from('attendance_record')
                  .select('id')
                  .eq('employee_id', employeeId)
                  .eq('date', todayStr)
                  .is('clock_out_time', null)
                  .order('clock_in_time', { ascending: false });

                if (fetchError) throw fetchError;

                if (!records || records.length === 0) {
                  console.log("Tidak menemukan baris aktif hari ini, mencoba mencari tanpa filter tanggal (sesi kemarin yang menggantung)...");
                  // Fallback: cari baris manapun yang paling baru yang belum absen pulang
                  const { data: fallbackRecords } = await supabase
                    .from('attendance_record')
                    .select('id')
                    .eq('employee_id', employeeId)
                    .is('clock_out_time', null)
                    .order('date', { ascending: false })
                    .order('clock_in_time', { ascending: false })
                    .limit(1);

                  if (fallbackRecords && fallbackRecords.length > 0) {
                    // Update baris gantung yang ditemukan
                    await supabase
                      .from('attendance_record')
                      .update({ clock_out_time: timeNowStr, status: 'Pulang' })
                      .eq('id', fallbackRecords[0].id);
                  } else {
                    // Jika benar-benar tidak ada, baru insert baris baru (agar data tidak hilang)
                    await supabase
                      .from('attendance_record')
                      .insert({
                        employee_id: employeeId,
                        date: todayStr,
                        clock_out_time: timeNowStr,
                        status: 'Pulang',
                        location_coordinates: userLocation ? `${userLocation.lat}, ${userLocation.lon}` : null,
                        verification_image_url: photoUri
                      });
                  }
                } else {
                  // Update baris terbaru yang ditemukan (yang clock_out_time-nya null)
                  const { error } = await supabase
                    .from('attendance_record')
                    .update({
                      clock_out_time: timeNowStr,
                      status: 'Pulang'
                    })
                    .eq('id', records[0].id);
                  if (error) throw error;
                }

                // Update Cache Global: Jangan set NULL, tapi simpan jam pulang agar Home bisa update status
                updateAttendance({
                  clock_in_time: records[0]?.clock_in_time || '--:--',
                  clock_out_time: timeNowStr,
                  date: todayStr,
                  status: 'Pulang'
                });

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
          // Upload ke Cloudinary terlebih dahulu jika ada foto
          let finalImageUrl = photoUri;
          if (hasPhoto && photoUri) {
            console.log("☁️ Mengunggah foto ke Cloudinary...");
            finalImageUrl = await uploadToCloudinary(photoUri);
            console.log("✅ Foto diunggah:", finalImageUrl);
          }

          // Simpan data
          const { error } = await supabase
            .from('attendance_record')
            .insert({
              employee_id: employeeId,
              date: todayStr,
              clock_in_time: timeNowStr,
              status: 'Mulai Bekerja',
              location_coordinates: userLocation ? `${userLocation.lat}, ${userLocation.lon}` : null,
              verification_image_url: finalImageUrl // Link permanen Cloudinary
            });

          if (error) throw error;

          // Update Cache Global agar Home langsung berubah
          updateAttendance({
            clock_in_time: timeNowStr,
            date: todayStr,
            status: 'Mulai Bekerja'
          });

          Alert.alert("Berhasil", "Absen berhasil dicatat.");
        } catch (error: any) {
          console.error("Database Error :", error);
          Alert.alert("Error", `Gagal simpan data: ${error.message}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
        <Text style={styles.salary}>Gaji Bulan ini : {employee?.salary || '0'}</Text>
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
            {isActive ? 'Bekerja' : 'Belum Mulai Bekerja'}
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert("Logout", "Apakah Anda yakin ingin Pulang?", [
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  salary:{
    fontSize: 18,
    color: '#333',
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
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
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

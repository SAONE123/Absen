import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmployee } from '@/hooks/useEmployee';

export default function Profile() {
  const { employee, logout } = useEmployee();

  const handleLogout = () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { text: "Ya", onPress: () => logout() }
    ]);
  };

  const InfoItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <View style={styles.infoItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color="#2196F3" />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Profil</Text>

      {/* Header / Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=' + employee?.id }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{employee?.name || 'Karyawan'}</Text>
        <Text style={styles.position}>{employee?.position || 'Staff'}</Text>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Personal</Text>
        <InfoItem icon="mail-outline" label="Email" value={employee?.email} />
        <InfoItem icon="call-outline" label="Nomor Telepon" value={employee?.phone_number} />
        <InfoItem icon="calendar-outline" label="Tanggal Bergabung" value={employee?.join_date} />
        <InfoItem icon="business-outline" label="Departemen" value="Produksi" />
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan Akun</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={22} color="#666" />
          <Text style={styles.settingText}>Notifikasi</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#F44336" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Versi 1.0.0 (Stable)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  position: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    color: '#444',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    color: '#CCC',
  }
});

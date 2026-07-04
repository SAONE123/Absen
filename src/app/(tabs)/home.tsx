import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHomeLogic } from '@/hooks/useHomeLogic';

export default function Home() {
  // Ambil data dan fungsi dari homeSetting (Business Logic)
  const { employee, attendance, workingDuration } = useHomeLogic();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Selamat Datang,</Text>
          <Text style={styles.userName}>{employee?.name || 'Karyawan'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Timer / Working Card (Live dari Cache) */}
      {attendance?.clock_in_time && !attendance?.clock_out_time && (
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Durasi Kerja Hari Ini</Text>
          <Text style={styles.timerValue}>{workingDuration}</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>Live (Cached)</Text>
          </View>
        </View>
      )}

      {/* Activity Section */}
      <View style={styles.statusBox}>
        <Text style={styles.sectionTitle}>Aktivitas Hari Ini</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTime}>{attendance?.clock_in_time || '--:--'}</Text>
            <Text style={styles.statusSub}>Masuk</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTime}>{attendance?.clock_out_time || '--:--'}</Text>
            <Text style={styles.statusSub}>Pulang</Text>
          </View>
        </View>
        <View style={[styles.badge, attendance?.clock_in_time && !attendance?.clock_out_time ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.badgeText, attendance?.clock_in_time && !attendance?.clock_out_time ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {attendance?.clock_in_time && !attendance?.clock_out_time ? 'SEDANG BEKERJA' : (attendance?.clock_out_time ? 'SUDAH PULANG' : 'BELUM ABSEN')}
          </Text>
        </View>
      </View>

      {/* Information Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Berita Internal</Text>
        <View style={styles.announcementCard}>
          <Ionicons name="megaphone-outline" size={24} color="#2196F3" style={styles.announcementIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.announcementTitle}>Pengumuman Kantor</Text>
            <Text style={styles.announcementText}>Diberitahukan kepada seluruh karyawan bahwa jam operasional akan kembali normal.</Text>
          </View>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBtn: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    borderWidth: 1,
    borderColor: '#fff',
  },
  timerCard: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timerLabel: {
    color: '#E3F2FD',
    fontSize: 14,
    marginBottom: 5,
  },
  timerValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  summaryCard: {
    width: '31%',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#333',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  statusBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusInfo: {
    alignItems: 'center',
  },
  statusTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEE',
  },
  badge: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: '#E8F5E9',
  },
  badgeInactive: {
    backgroundColor: '#F5F5F5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  badgeTextActive: {
    color: '#4CAF50',
  },
  badgeTextInactive: {
    color: '#999',
  },
  infoSection: {
    marginBottom: 25,
  },
  announcementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  announcementIcon: {
    marginRight: 15,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  announcementText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

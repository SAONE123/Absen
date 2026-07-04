import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Salary() {
  const SalaryItem = ({ month, year, amount }: { month: string, year: string, amount: string }) => (
    <TouchableOpacity style={styles.salaryItem}>
      <View style={styles.salaryInfo}>
        <Text style={styles.salaryMonth}>{month} {year}</Text>
        <Text style={styles.salaryAmount}>Rp {amount}</Text>
      </View>
      <Ionicons name="download-outline" size={24} color="#2196F3" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Gaji & Benefit</Text>

      {/* Featured Card */}
      <View style={styles.featuredCard}>
        <Text style={styles.featuredLabel}>Estimasi Gaji Bulan Ini</Text>
        <Text style={styles.featuredAmount}>Rp 5.250.000</Text>
        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Terproses</Text>
          </View>
        </View>
      </View>

      {/* Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rincian Terakhir (Juni 2026)</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Gaji Pokok</Text>
          <Text style={styles.rowValue}>Rp 4.000.000</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tunjangan Makan</Text>
          <Text style={styles.rowValue}>Rp 800.000</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tunjangan Transport</Text>
          <Text style={styles.rowValue}>Rp 500.000</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Bersih</Text>
          <Text style={styles.totalValue}>Rp 5.300.000</Text>
        </View>
      </View>

      {/* History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Riwayat Slip Gaji</Text>
        <SalaryItem month="Mei" year="2026" amount="5.300.000" />
        <SalaryItem month="April" year="2026" amount="5.150.000" />
        <SalaryItem month="Maret" year="2026" amount="5.300.000" />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
  },
  featuredCard: {
    backgroundColor: '#2196F3',
    borderRadius: 24,
    padding: 25,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuredLabel: {
    color: '#E3F2FD',
    fontSize: 14,
    marginBottom: 8,
  },
  featuredAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  tagContainer: {
    marginTop: 15,
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowLabel: {
    color: '#666',
    fontSize: 14,
  },
  rowValue: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  historySection: {
    marginBottom: 20,
  },
  salaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  salaryInfo: {
    flex: 1,
  },
  salaryMonth: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  salaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  }
});

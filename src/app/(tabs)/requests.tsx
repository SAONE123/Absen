import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRequestsLogic } from '@/hooks/useRequestsLogic';

export default function Requests() {
  const {
    requestType, setRequestType,
    reason, setReason,
    selectedDate, setSelectedDate,
    endDate, setEndDate,
    showDatePicker, setShowDatePicker,
    showEndDatePicker, setShowEndDatePicker,
    loading,
    history,
    fetchingHistory,
    handleSubmit,
    getStatusColor
  } = useRequestsLogic();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Permohonan</Text>
      <Text style={styles.subTitle}>Ajukan izin, cuti, atau pemberitahuan sakit.</Text>

      {/* Tabs Selection */}
      <View style={styles.tabContainer}>
        {['Izin', 'Cuti', 'Sakit'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tab, requestType === type && styles.tabActive]}
            onPress={() => setRequestType(type)}
          >
            <Text style={[styles.tabText, requestType === type && styles.tabTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Form */}
      <View style={styles.formCard}>
        <Text style={styles.label}>Tanggal Pengajuan</Text>
        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color="#2196F3" />
          <Text style={styles.dateDisplayText}>
            {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#999" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        <Text style={styles.label}>Sampai Tanggal (Opsional)</Text>
        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color="#9C27B0" />
          <Text style={[styles.dateDisplayText, !endDate && { color: '#999' }]}>
            {endDate
              ? endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Pilih tanggal selesai...'}
          </Text>
          {endDate && (
            <TouchableOpacity onPress={() => setEndDate(null)} style={{ marginLeft: 10 }}>
              <Ionicons name="close-circle" size={20} color="#F44336" />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-down" size={16} color="#999" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowEndDatePicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        <Text style={styles.label}>Alasan / Keperluan</Text>
        <TextInput
          style={styles.input}
          placeholder={`Jelaskan detail ${requestType.toLowerCase()} Anda...`}
          multiline
          numberOfLines={6}
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Ajukan Sekarang</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* History Section */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Riwayat Permohonan</Text>

        {fetchingHistory ? (
          <ActivityIndicator color="#2196F3" style={{ marginTop: 20 }} />
        ) : history.length > 0 ? (
          history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={styles.historyType}>{item.permohonan}</Text>
                  <Text style={styles.historyDate}>{item.requestDate || '-'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.konfirmasi) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.konfirmasi) }]}>
                    {item.konfirmasi}
                  </Text>
                </View>
              </View>
              <Text style={styles.historyReason} numberOfLines={2}>{item.alasan}</Text>
            </View>
          ))
        ) : (
          <View style={styles.historyEmpty}>
            <Ionicons name="document-text-outline" size={40} color="#CCC" />
            <Text style={styles.historyEmptyText}>Belum ada riwayat permohonan.</Text>
          </View>
        )}
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
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 25,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEE',
    borderRadius: 12,
    padding: 5,
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#2196F3',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  dateDisplayText: {
    marginLeft: 10,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 15,
    color: '#333',
  },
  submitBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historySection: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  historyType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  historyEmpty: {
    alignItems: 'center',
    marginTop: 20,
  },
  historyEmptyText: {
    color: '#999',
    marginTop: 10,
    fontSize: 13,
  }
});

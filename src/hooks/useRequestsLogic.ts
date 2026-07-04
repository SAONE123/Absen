import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/firebase/firebaseConfig';
import { useEmployee } from '@/hooks/useEmployee';
import { useNavigation } from 'expo-router';

export const useRequestsLogic = () => {
  const { employee } = useEmployee();
  const navigation = useNavigation();
  const [requestType, setRequestType] = useState('Izin');
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // 1. Ambil riwayat permohonan dari database
  const fetchHistory = async () => {
    if (!employee?.id) return;
    setFetchingHistory(true);
    try {
      const { data, error } = await supabase
        .from('permohonan')
        .select('*')
        .eq('id_karyawan', employee.id)
        .order('id', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error("Fetch History Error:", error.message);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchHistory();
    });
    return unsubscribe;
  }, [navigation, employee]);

  const handleSubmit = async () => {
    if (!employee?.id) {
      Alert.alert("Error", "Sesi berakhir, silakan login kembali.");
      return;
    }

    if (reason.trim().length < 5) {
      Alert.alert("Error", "Mohon masukkan alasan yang jelas (minimal 5 karakter).");
      return;
    }

    // Format Tanggal: Tunggal atau Rentang
    let dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (endDate) {
      dateStr = `${dateStr} SAMPAI ${endDate.toLocaleDateString('en-CA')}`;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('permohonan')
        .insert({
          nama_karyawan: employee.name,
          id_karyawan: employee.id,
          permohonan: requestType,
          alasan: reason.trim(),
          requestDate: dateStr,
          konfirmasi: 'Pending'
        });

      if (error) throw error;

      Alert.alert("Terkirim", `Permohonan ${requestType} Anda telah diajukan.`);
      setReason('');
      setEndDate(null);
      fetchHistory(); // Refresh riwayat
    } catch (error: any) {
      console.error("Submit Request Error:", error.message);
      Alert.alert("Gagal", `Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disetujui': return '#4CAF50';
      case 'Ditolak': return '#F44336';
      default: return '#FF9800';
    }
  };

  return {
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
  };
};

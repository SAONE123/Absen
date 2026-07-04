import { useState, useEffect, useRef } from 'react';
import { useEmployee } from '@/hooks/useEmployee';
import { supabase } from '@/firebase/firebaseConfig';
import { useNavigation } from 'expo-router';

/**
 * Hook khusus untuk menangani logika dashboard Home
 * Memisahkan Business Logic dari UI
 */
export const useHomeLogic = () => {
  const { employee, attendance, updateAttendance, isReady } = useEmployee();
  const navigation = useNavigation();
  const [workingDuration, setWorkingDuration] = useState('00:00:00');
  const isFetching = useRef(false);

  // 1. Ambil data aktivitas hari ini dari Supabase
  const fetchTodayActivity = async (force = false) => {
    // Jangan fetch jika: belum ready, tidak ada employee, atau sedang fetching
    if (!isReady || !employee?.id || isFetching.current) return;

    // Jika tidak dipaksa (force), jangan fetch jika data attendance sudah ada di cache
    if (!force && attendance) return;

    isFetching.current = true;
    const today = new Date().toLocaleDateString('en-CA');
    console.log(`🔍 Fetching activity for: ${today}, User: ${employee.id}`);

    try {
      const { data, error } = await supabase
        .from('attendance_record')
        .select('clock_in_time, clock_out_time, status, date')
        .eq('employee_id', employee.id)
        .eq('date', today)
        .order('clock_in_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Cek apakah data baru berbeda dengan yang di cache sebelum update
        const hasChanged = !attendance ||
                           attendance.clock_in_time !== data.clock_in_time ||
                           attendance.clock_out_time !== data.clock_out_time;

        if (hasChanged) {
          console.log("✅ Today record updated from DB");
          updateAttendance(data);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching today activity:", error);
    } finally {
      isFetching.current = false;
    }
  };

  // Trigger fetch saat pertama kali load
  useEffect(() => {
    if (isReady && employee && !attendance) {
      fetchTodayActivity();
    }
  }, [isReady, employee, attendance]);

  // Refresh data saat layar difokuskan
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTodayActivity(true); // Paksa fetch saat layar difokuskan kembali
    });

    return unsubscribe;
  }, [navigation, employee, isReady]);

  // 2. Logika Penghitung Waktu (Timer) - Selalu membaca dari cache 'attendance'
  useEffect(() => {
    let interval: any;

    if (attendance?.clock_in_time && !attendance?.clock_out_time) {
      console.log("⏱️ Timer Memulai dari Cache, Jam Masuk:", attendance.clock_in_time);

      interval = setInterval(() => {
        const now = new Date();
        const startTime = new Date();

        const timeParts = attendance.clock_in_time.includes('.')
          ? attendance.clock_in_time.split('.')
          : attendance.clock_in_time.split(':');

        if (timeParts.length >= 2) {
          const h = parseInt(timeParts[0], 10);
          const m = parseInt(timeParts[1], 10);
          const s = timeParts.length === 3 ? parseInt(timeParts[2], 10) : 0;

          startTime.setHours(h, m, s, 0);
          const diff = now.getTime() - startTime.getTime();

          if (diff > 0) {
            const totalSeconds = Math.floor(diff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            setWorkingDuration(
              `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
          } else {
            setWorkingDuration('00:00:00');
          }
        }
      }, 1000);
    } else {
      setWorkingDuration('00:00:00');
    }

    return () => clearInterval(interval);
  }, [attendance]);

  return {
    employee,
    attendance,
    workingDuration,
    fetchTodayActivity
  };
};

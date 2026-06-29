import supabase from './supabaseAdmin.js';

async function testSupabaseConnection() {
  console.log("🚀 Memulai pengujian koneksi Supabase via supabaseAdmin.js...");

  try {
    // 1. Tes ambil data karyawan
    const { data: employees, error: empError } = await supabase
      .from('employee')
      .select('*')
      .limit(5);

    if (empError) {
      console.error("❌ Gagal mengambil data employee:", empError.message);
    } else {
      console.log("✅ Berhasil terhubung ke tabel 'employee'. Jumlah data:", employees ? employees.length : 0);
      if (employees && employees.length > 0) console.table(employees);
    }

    // 2. Tes ambil data attendance_record
    const { data: attendance, error: attError } = await supabase
      .from('attendance_record')
      .select('*')
      .limit(5);

    if (attError) {
      console.error("❌ Gagal mengambil data attendance_record:", attError.message);
    } else {
      console.log("✅ Berhasil terhubung ke tabel 'attendance_record'.");
      if (attendance && attendance.length > 0) console.table(attendance);
    }

    console.log("\n✨ Pengujian Selesai!");
  } catch (err) {
    console.error("❌ Terjadi kesalahan fatal:", err.message);
  }
}

testSupabaseConnection();

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push } = require('firebase/database');
const { v4: uuidv4 } = require('uuid');

// Pastikan variabel lingkungan ini sesuai dengan .env Anda
const firebaseConfig = {
  apiKey: "AIzaSyBMlt5z2h9rDCt3RFy7CCopmvtfMxWs5VU",
  authDomain: "absensi-47190.firebaseapp.com",
  projectId: "absensi-47190",
  storageBucket: "absensi-47190.appspot.com",
  messagingSenderId: "324166436127",
  appId: "1:324166436127:android:72a87795844f47ffa6dc2a",
  databaseURL: "https://absensi-47190-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function initializeDatabase() {
  console.log("🚀 Memulai inisialisasi database...");

  try {
    // 1. Buat Department (UUID Dasar)
    const deptId = uuidv4();
    const departmentData = {
      departmentName: "IT Operations",
      managerName: "Budi Santoso"
    };
    await set(ref(database, `departments/${deptId}`), departmentData);
    console.log(`✅ Department dibuat: ${deptId}`);

    // 2. Buat Employee (Connect ke Department)
    const employeeId = uuidv4();
    const employeeData = {
      name: "Irsyad Kambing",
      email: "irsyad@example.com",
      position: "Senior Developer",
      phoneNumber: "08123456789",
      joinDate: new Date().toISOString().split('T')[0],
      departmentId: deptId // Link ke Department
    };
    await set(ref(database, `employees/${employeeId}`), employeeData);
    console.log(`✅ Employee dibuat: ${employeeId}`);

    // 3. Buat Shift (Connect ke Employee)
    const shiftData = {
      employeeId: employeeId,
      hoursOfShift: 8.0,
      location: "Jakarta Office",
      gracePeriod: 15 // minutes
    };
    await push(ref(database, `shifts/${employeeId}`), shiftData);
    console.log(`✅ Shift ditambahkan untuk employee: ${employeeId}`);

    // 4. Buat AttendanceRecord (Connect ke Employee)
    const attendanceData = {
      employeeId: employeeId,
      date: new Date().toISOString().split('T')[0],
      clockInTime: Date.now(),
      clockOutTime: null,
      status: "Present",
      remarks: "On Time",
      locationCoordinates: "-6.2325, 106.5449",
      verificationImageUrl: "https://i.pravatar.cc/300?u=verified"
    };
    await push(ref(database, `attendanceRecords/${employeeId}`), attendanceData);
    console.log(`✅ Attendance Record ditambahkan untuk employee: ${employeeId}`);

    // 5. Buat MonthlyReport (Connect ke Employee)
    const reportData = {
      employeeId: employeeId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      totalPresent: 1,
      totalAbsent: 0,
      totalLate: 0,
      totalOvertimeHours: 0.0
    };
    await set(ref(database, `monthlyReports/${employeeId}/${reportData.year}_${reportData.month}`), reportData);
    console.log(`✅ Monthly Report diinisialisasi untuk employee: ${employeeId}`);

    console.log("\n✨ Inisialisasi Database Selesai dengan Sukses!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal menginisialisasi database:", error);
    process.exit(1);
  }
}

initializeDatabase();

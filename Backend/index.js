const admin = require("firebase-admin");
const { getDataConnect } = require("firebase-admin/data-connect");
const { v5: uuidv5 } = require('uuid');

// Namespace UUID (Anda bisa mengganti ini dengan UUID valid apapun)
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// 1. Inisialisasi Admin SDK dengan Service Account
// Pastikan file serviceAccountKey.json ada di folder Backend
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://absensi-47190-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

// 2. Konfigurasi SQL Connect (Data Connect)
// Service ID biasanya adalah nama yang Anda berikan saat membuat Data Connect (misal: 'absensi-sql')
// JANGAN gunakan URL lengkap di sini.
const sqlConnect = getDataConnect({
  serviceId: "absensi-47190-3-services", // Ganti dengan SERVICE ID yang benar dari konsol
  location: "asia-southeast1"
});

console.log("🚀 Standalone Backend Listener sedang berjalan...");
console.log("Menunggu data baru di /users/ dan /attendance/ ...");

// Waktu saat script dimulai untuk memfilter data lama
const SCRIPT_START_TIME = Date.now();

// Objek untuk menyimpan state cache agar tidak mengirim data yang sama berulang kali
const syncCache = {
  users: new Set(),
  attendance: new Map()
};

/**
 * 1. LOGIKA SYNC USER (Hanya data baru atau yang belum ada)
 */
const usersRef = db.ref("users");
usersRef.on("child_added", async (snapshot) => {
  const rawId = snapshot.key;
  const userData = snapshot.val();

  // Jika data sangat lama (sebelum script jalan), kita lewati log-nya agar tidak spam
  // Tapi tetap kita masukkan ke cache agar tidak diproses lagi
  const userId = rawId.includes('-') && rawId.length === 36 ? rawId : uuidv5(rawId, NAMESPACE);
  if (syncCache.users.has(userId)) return;

  // Gunakan UPSERT
  const mutation = `
    mutation UpsertUser($id: UUID!, $name: String!) {
      employee_upsert(data: { id: $id, name: $name, email: "${userData.email || ''}", position: "Staff" })
    }
  `;

  try {
    await sqlConnect.executeGraphql(mutation, { variables: { id: userId, name: userData.name || "Unknown" } });
    syncCache.users.add(userId);
    // Hanya tampilkan log jika ini adalah user yang baru saja ditambahkan saat script aktif
    if (userData.createdAt > SCRIPT_START_TIME || !userData.createdAt) {
      console.log(`\n👤 User Tersinkron: ${rawId} (${userId})`);
    }
  } catch (error) {
    console.error(`❌ Gagal sync user ${userId}:`, error.message);
  }
});

/**
 * 2. LOGIKA SYNC ABSENSI (Filter Data Real-time)
 */
const attendanceRef = db.ref("attendance");

attendanceRef.on("child_added", (userSnapshot) => {
  const rawUserId = userSnapshot.key;
  const userId = rawUserId.includes('-') && rawUserId.length === 36 ? rawUserId : uuidv5(rawUserId, NAMESPACE);

  // Gunakan .orderByChild('timestamp').startAt(SCRIPT_START_TIME)
  // agar HANYA data yang dibuat SETELAH script dijalankan yang diproses
  db.ref(`attendance/${rawUserId}`)
    .orderByChild('timestamp')
    .startAt(SCRIPT_START_TIME)
    .on("child_added", async (recordSnapshot) => {
      const recordData = recordSnapshot.val();
      const isCheckIn = recordData.type === 'IN';
      const dateStr = new Date(recordData.timestamp).toISOString().split('T')[0];
      const cacheKey = `${userId}_${dateStr}_${recordData.type}_${recordData.timestamp}`;

      // Guardrail: Cek cache internal
      if (syncCache.attendance.has(cacheKey)) return;

      const timeString = new Date(recordData.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\./g, ':');

      console.log(`\n🕒 Record Absen Baru (${recordData.type}): User ${rawUserId} pada ${timeString}`);

      const recordId = uuidv5(`${userId}_${dateStr}`, NAMESPACE);
      let mutation = isCheckIn ? `
        mutation UpsertIn($id: UUID!, $employeeId: UUID!, $date: Date!, $status: String!, $location: String, $photo: String, $timeIn: String) {
          attendanceRecord_upsert(data: {
            id: $id,
            employee: { id: $employeeId },
            date: $date,
            status: $status,
            locationCoordinates: $location,
            verificationImageUrl: $photo,
            clockInTime: $timeIn
          })
        }
      ` : `
        mutation UpsertOut($id: UUID!, $employeeId: UUID!, $date: Date!, $status: String!, $location: String, $photo: String, $timeOut: String) {
          attendanceRecord_upsert(data: {
            id: $id,
            employee: { id: $employeeId },
            date: $date,
            status: $status,
            locationCoordinates: $location,
            verificationImageUrl: $photo,
            clockOutTime: $timeOut
          })
        }
      `;

      let variables = {
        id: recordId,
        employeeId: userId,
        date: dateStr,
        status: recordData.status,
        location: recordData.location ? `${recordData.location.lat}, ${recordData.location.lon}` : null,
        photo: recordData.photoUri || null,
        [isCheckIn ? 'timeIn' : 'timeOut']: timeString
      };

      try {
        await sqlConnect.executeGraphql(mutation, { variables });
        syncCache.attendance.set(cacheKey, true);
        console.log(`✅ Record ${recordData.type} (${timeString}) berhasil di-sync ke SQL.`);
      } catch (error) {
        console.error(`❌ Gagal sync absen:`, error.message);
      }
    });
});

// Menangani penutupan script agar tidak langsung mati
process.on('SIGINT', () => {
  console.log("\n👋 Mematikan listener...");
  process.exit();
});

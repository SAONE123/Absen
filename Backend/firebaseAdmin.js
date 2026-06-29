const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://absensi-47190-default-rtdb.asia-southeast1.firebasedatabase.app"
});

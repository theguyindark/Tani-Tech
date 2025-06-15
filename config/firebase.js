const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "tani-tech",
    clientEmail: "firebase-adminsdk-fbsvc@tani-tech.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4elm30KKU3uno\nk6BPqpvpcss1SKcyMXxsCKJ5drdYbOpwVKEW4p6HerSKR8T6uPWsxx/XVfoozs4b\n1OU19UPjWUKWi+wZdgS+HcpVmWq3xi6fm+R6Xg8SzFX0FzpWdZtRIrkVoF/CLpup\nk/pfX2obY7oqW9cXcbRGsa+73VLH0ZcfwLscYRgcivUosFcpcQLuOfuBiWg+FYOv\nbuH2UW5dB/AWacOEzQVzlGfAwipidAwN1k5wZiwd3XrGEba9zsKKwZZabBqe9kAT\nlGCFU5LgqdL2kj5WbiyzqIxEzx8otf+16ZpP0E51oiwmZ43S/w0eWFNNm7Nvcafx\nvQ2hCczZAgMBAAECggEADBtTegHCObzrYu0VT0UmGEsFVQjgmCWxQbHLX+dPnwj+\n1cJoFAVpXADMimqtXbr3vJAQ4ePtl/ICiscNB96BxxDbkt+57e3V39g6qCV6YHcs\nJiNn+jPkD1rDpVJE7NmpCMkblnTA9BB0/MsOWmX7o7KGzDLcydgXebA9lTmwLhbR\nqhb3gQhMCLeRzrwRwf2UiJK27V1HbAfWHBcdPyb+Q+IURNb8rQ8292g1FhQZVOQE\nGBgBmqvf+HcFwOHPUR51jUWEgSPa48aCRU8n9RXIrWA7Byr/590LugW7L4SHrUxo\ndd/36fZCYlTJdbqKeo1LjFY7fk76G2GXcT1DdaTK0QKBgQDczt6lZv+rZG67u9HD\ntCjY2PjmDskla/Hxq9Rqu+J1JKfdlDe72W2AL4Gk1jeFwDtVrOLoFyrX734yQjy/\ns+IwOghD5BJrv30zAI6E5fWRhf+fRxuziS1sg2pxoWkMT4D9dB+Eb/mTt0xv9yMJ\nJaQX+lh8p2ZEQHDME95wKgP7lQKBgQDV4S8hE7u20nEwa2OERtXaUNHtn7yVW607\n83W4oEJ8h+82G2Mp5CmnCW9JiSd05f7Mog+SPBjybWfIIj5OLor6BFqybjvrubZ5\nWpnuLcHG1eD/KgPmeOoczJO+EXhVwqS+gVUUY/cWm9yuhgydnGe/pzJhxvoRLbY6\n31DLXHYbNQKBgE2D9hd8zB6AGHuhWOdqNLjDmsUwxZ50gbBEkUKTCNH091VLNjGl\nB9LrWojihwVWUb4m/lVZ5Ll/ov7D0A3AeZRSmxoyU+EtjSc9d8rh686ViwKAdRIX\nAzJIBDM15enjczYG8RWONcCMpbHcwZjxdOTSBwRjw/wL301VYE5iAZntAoGBAIGU\njtNBe2dGlKE7Tu3jZMmCUc3gC4eKJai+1kHnhqCgUwO7EBdfTwUOqEgrOqaOehNM\n1JZKpuqp8kjExm7jr/vOC40zUEZ/G9jmVYCCZHatOkYeFILcGysbnx92witjZCCv\nhvZ1okwmXku2l4oeKpVpHRM0VGl4AoIkrnSnLj9JAoGALYy+HuxdV+HGVcTRgGy4\n5KhxwKOhHLkTZ9sGNUUbQtGrwCi1HFd6X5g0nDg+FNGgzGtDLItKOvoy5jx1MgyO\nvtjWW75l+6hMqFcEZHGbDdn5fEmkDJUM7BzOLd52stSgW+sSKaeyt3+VGcqwadlg\na2xKXTFH8GyPUIFHyPJ5BsM=\n-----END PRIVATE KEY-----\n",
  }),
  databaseURL: "https://tani-tech.firebaseio.com"
});

const db = admin.firestore();

// Enable offline persistence
db.settings({
  cacheSizeBytes: 50 * 1024 * 1024, // 50 MB
  ignoreUndefinedProperties: true
});

module.exports = { admin, db }; 
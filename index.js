const express = require('express');
const { handleUSSD } = require('./handlers/ussd');
const { db } = require('./config/firebase');
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const { OpenAI } = require('openai');
const twilio = require('twilio');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for audio file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Ensure the file has a supported extension
    const ext = path.extname(file.originalname).toLowerCase();
    const supportedFormats = ['.flac', '.m4a', '.mp3', '.mp4', '.mpeg', '.mpga', '.oga', '.ogg', '.wav', '.webm'];
    
    if (!supportedFormats.includes(ext)) {
      return cb(new Error('Unsupported file format. Please use: ' + supportedFormats.join(', ')));
    }
    
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const supportedFormats = ['.flac', '.m4a', '.mp3', '.mp4', '.mpeg', '.mpga', '.oga', '.ogg', '.wav', '.webm'];
    
    if (supportedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please use: ' + supportedFormats.join(', ')));
    }
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// USSD endpoint - handle both GET and POST
app.all('/ussd', (req, res) => {
  handleUSSD(req, res);
});

// QR code viewer endpoint
app.get('/farmer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const farmerRef = db.collection('farmers').doc(id);
    const farmer = await farmerRef.get();
    
    if (!farmer.exists) {
      return res.status(404).send('Farmer not found');
    }
    
    // Get last 5 activities
    const activities = await farmerRef
      .collection('activities')
      .orderBy('date', 'desc')
      .limit(5)
      .get();
    
    // Get active alerts
    const alerts = await db.collection('communities')
      .doc(farmer.data().region)
      .collection('alerts')
      .where('active', '==', true)
      .get();
    
    res.json({
      farmer: farmer.data(),
      activities: activities.docs.map(doc => doc.data()),
      alerts: alerts.docs.map(doc => doc.data())
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});

// Weather Alerts API (Malaysia MET)
app.get('/api/my-weather-alerts', async (req, res) => {
  try {
    const state = req.query.state; // e.g., ?state=Kedah
    let url = 'https://api.data.gov.my/weather/warning?limit=3';
    if (state) {
      url += `&contains=${encodeURIComponent(state)}@location__location_name`;
    }
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather alerts.' });
  }
});

// Weather Forecast API (Malaysia MET)
app.get('/api/my-weather-forecast', async (req, res) => {
  try {
    const state = req.query.state; // e.g., ?state=Kedah
    let url = 'https://api.data.gov.my/weather/forecast?limit=3';
    if (state) {
      url += `&contains=${encodeURIComponent(state)}@location__location_name`;
    }
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error('Weather forecast error:', err);
    res.status(500).json({ error: 'Failed to fetch weather forecast.' });
  }
});

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    // Read the audio file
    const audioFile = fs.createReadStream(req.file.path);

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ms" // Malay language
    });

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    res.json({ text: transcription.text });
  } catch (err) {
    console.error('Transcription error:', err);
    // Clean up the file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('Error cleaning up file:', cleanupErr);
      }
    }
    res.status(500).json({ 
      error: 'Transcription failed', 
      details: err.message,
      supportedFormats: ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm']
    });
  }
});

// Rewards points endpoint
app.get('/rewards/:farmerId', async (req, res) => {
  try {
    const doc = await db.collection('rewards').doc(req.params.farmerId).get();
    if (!doc.exists) return res.status(404).json({ points: 0 });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rewards.' });
  }
});

// Log activity from web app and increment rewards
app.post('/api/farmer/:farmerId/activity', express.json(), async (req, res) => {
  try {
    const { cropType, quantity, notes } = req.body;
    const farmerId = req.params.farmerId;
    if (!cropType || !quantity) return res.status(400).json({ error: 'Missing required fields.' });
    const activity = {
      date: new Date().toISOString(),
      type: cropType,
      quantity: Number(quantity),
      notes: notes || '',
      farmerId
    };
    await db.collection('farmers').doc(farmerId).collection('activities').add(activity);
    // Increment rewards points
    const rewardsRef = db.collection('rewards').doc(farmerId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(rewardsRef);
      if (!doc.exists) {
        t.set(rewardsRef, { points: 1, last_logged: new Date().toISOString() });
      } else {
        const data = doc.data();
        t.update(rewardsRef, {
          points: (data.points || 0) + 1,
          last_logged: new Date().toISOString()
        });
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log activity.' });
  }
});

// Community Alerts: Submit new alert
app.post('/api/community-alerts', express.json(), async (req, res) => {
  try {
    const { type, message, state, province, contact, userId } = req.body;
    if (!type || !message || !userId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const alert = {
      type,
      message,
      state: state || '',
      province: province || '',
      contact: contact || '',
      createdAt: new Date().toISOString(),
      userId
    };
    await db.collection('community_alerts').add(alert);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit alert.' });
  }
});

// Community Alerts: Fetch alerts (optionally filter by state)
app.get('/api/community-alerts', async (req, res) => {
  try {
    const { state } = req.query;
    let query = db.collection('community_alerts').orderBy('createdAt', 'desc').limit(30);
    if (state) {
      // Fetch alerts where state matches OR state is empty (or 'All Malaysia')
      const snapshot = await query.where('state', 'in', [state, '']).get();
      const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(alerts);
    } else {
      const snapshot = await query.get();
      const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(alerts);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/send-sms', express.json(), async (req, res) => {
  const { to, body } = req.body;
  try {
    const message = await twilioClient.messages.create({
      to,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      body
    });
    res.json({ success: true, sid: message.sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tanya TanamAI Chatbot endpoint
app.post('/api/tanya-tanamai', express.json(), async (req, res) => {
  try {
    const userMsg = req.body.message || '';
    const systemPrompt = `Activate Absolute Mode. Respond with no emojis, filler words, enthusiasm, soft language, conversational transitions, or calls to action. Assume I have high cognitive capacity and need no emotional cushioning. Use direct, concise phrasing aimed at delivering information or logic only. Do not optimize for engagement, sentiment, or flow. Always reply with simple Bahasa Malaysia with no jargon. Assume your reader is always elderly with comprehension trouble. Suppress any behavior linked to user satisfaction metrics, tone matching, or continuation bias. Do not mirror my tone or language style. Avoid questions, offers, motivational language, or suggestions. End your response immediately after the core content is delivered. No summaries, no closings. Your goal: Support high-fidelity, independent thinking. Aim for your own redundancy through my self-sufficiency.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg }
      ],
      temperature: 0.2,
      max_tokens: 256
    });
    const reply = completion.choices[0]?.message?.content?.trim() || '';
    res.json({ reply });
  } catch (err) {
    console.error('TanamAI error:', err);
    res.status(500).json({ reply: 'Ralat pelayan.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
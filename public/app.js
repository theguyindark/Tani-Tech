// SPA navigation
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('d-none'));
  document.getElementById(screenId).classList.remove('d-none');
  // Clear audio input and transcribe result when showing log activity screen
  if (screenId === 'logActivityScreen') {
    const audioInput = document.getElementById('audioInput');
    const transcribeResult = document.getElementById('transcribeResult');
    if (audioInput) audioInput.value = '';
    if (transcribeResult) transcribeResult.textContent = '';
  }
}

// Set today's date
function setTodayDate() {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('todayDate').textContent = today.toLocaleDateString('en-GB', options);
}

// Dummy activities data
const activities = [
  { id: 1, status: 'progress', title: 'Menuai 50kg Padi', user: 'Ali', time: 'Esok - 8:00am', percent: 75 },
  { id: 2, status: 'completed', title: 'Menanam Sawit', user: 'Ali', time: 'Semalam - 10:00am', percent: 100 },
  { id: 3, status: 'pending', title: 'Baja Getah', user: 'Ali', time: 'Hari ini - 2:00pm', percent: 0 },
  // Dummy recommended activities (now status: 'cadangan')
  { id: 4, status: 'cadangan', title: 'Siram tanaman Padi', user: 'Ali', time: 'Cadangan Hari Ini', percent: 0 },
  { id: 5, status: 'cadangan', title: 'Periksa perosak pada Cili', user: 'Ali', time: 'Cadangan Minggu Ini', percent: 0 },
  { id: 6, status: 'cadangan', title: 'Bersihkan kawasan kebun', user: 'Ali', time: 'Cadangan Minggu Ini', percent: 0 },
  { id: 7, status: 'cadangan', title: 'Tuai Jagung masak', user: 'Ali', time: 'Cadangan Hari Ini', percent: 0 },
  { id: 8, status: 'cadangan', title: 'Tabur baja pada Sayur', user: 'Ali', time: 'Cadangan Minggu Ini', percent: 0 },
];

function renderActivities(filter) {
  const list = document.getElementById('activityList');
  list.innerHTML = '';
  let filtered = activities;
  if (filter === 'aktiviti') filtered = activities.filter(a => a.status === 'pending' || a.status === 'progress');
  else if (filter === 'cadangan') filtered = activities.filter(a => a.status === 'cadangan');
  else if (filter === 'completed' || filter === 'selesai') filtered = activities.filter(a => a.status === 'completed');
  // 'all' shows all
  if (filtered.length === 0) {
    list.innerHTML = '<div class="text-center text-muted">Tiada aktiviti dijumpai.</div>';
    return;
  }
  filtered.forEach(a => {
    list.innerHTML += `
      <div class="card mb-3">
        <div class="card-body d-flex align-items-center justify-content-between">
          <div>
            <div class="fw-bold">${a.title}</div>
            <div class="small text-muted">${a.time}</div>
          </div>
          <div class="text-end">
            <div class="badge bg-${a.status === 'completed' ? 'success' : a.status === 'progress' ? 'primary' : a.status === 'cadangan' ? 'info' : 'warning'} bg-opacity-10 text-${a.status === 'completed' ? 'success' : a.status === 'progress' ? 'primary' : a.status === 'cadangan' ? 'info' : 'warning'}">
              ${a.status === 'cadangan' ? 'Cadangan' : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
            </div>
            <div class="small text-muted mt-1">${a.percent}%</div>
          </div>
        </div>
      </div>
    `;
  });
}

function filterActivities(status) {
  renderActivities(status);
  document.querySelectorAll('#activityTabs .nav-link').forEach(tab => tab.classList.remove('active'));
  if (status === 'all') document.querySelector('#activityTabs .nav-link').classList.add('active');
  else document.querySelector(`#activityTabs .nav-link[onclick*="${status}"]`).classList.add('active');
}

// Fetch and display weather alerts from backend
async function loadMyWeatherAlerts() {
  const warningsDiv = document.getElementById('weatherWarningsDisplay');
  const state = document.getElementById('stateSelect')?.value || '';
  warningsDiv.innerHTML = 'Loading weather alerts...';
  try {
    const res = await fetch('/api/my-weather-alerts' + (state ? `?state=${encodeURIComponent(state)}` : ''));
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      warningsDiv.innerHTML = data.map((a, i) => `
        <div class="alert-card weather-card mb-2 p-3">
          <div class="fw-bold text-danger mb-1">${a.heading_en || a.heading_bm}</div>
          <a href="#" class="small" data-warning-index="${i}" data-bs-toggle="modal" data-bs-target="#weatherWarningModal">View Details</a>
        </div>
      `).join('');
      // Add click listeners for 'View Details'
      data.forEach((a, i) => {
        setTimeout(() => {
          const link = document.querySelector(`[data-warning-index="${i}"]`);
          if (link) {
            link.addEventListener('click', function(e) {
              e.preventDefault();
              document.getElementById('weatherWarningModalLabel').textContent = a.heading_en || a.heading_bm;
              document.getElementById('weatherWarningModalBody').innerHTML = `
                <div>${a.text_en || a.text_bm}</div>
                <div class='small text-muted mt-2'>${a.instruction_en || a.instruction_bm || ''}</div>
              `;
            });
          }
        }, 0);
      });
    } else {
      warningsDiv.innerHTML = '<div class="alert alert-success weather-card">No weather alerts for your area.</div>';
    }
  } catch (err) {
    warningsDiv.innerHTML = '<div class="alert alert-danger weather-card">Failed to load weather alerts.</div>';
  }
}

// Fetch and display weather forecast from backend
async function loadMyWeatherForecast() {
  const state = document.getElementById('stateSelect')?.value || '';
  const forecastDiv = document.getElementById('forecastDisplay');
  forecastDiv.innerHTML = 'Loading forecast...';
  try {
    const res = await fetch('/api/my-weather-forecast' + (state ? `?state=${encodeURIComponent(state)}` : ''));
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      forecastDiv.innerHTML = data.map(f => {
        let locationName = f.location__location_name || (f.location && f.location.location_name) || 'Unknown';
        return `<div class='forecast-card mb-2'>
          <b>${locationName} (${f.date})</b><br>
          Pagi: ${f.morning_forecast}<br>
          Petang: ${f.afternoon_forecast}<br>
          Malam: ${f.night_forecast}<br>
          Suhu: ${f.min_temp}°C - ${f.max_temp}°C
        </div>`;
      }).join('');
    } else {
      forecastDiv.innerHTML = '<div class="forecast-card">No forecast data for your area.</div>';
    }
  } catch (err) {
    forecastDiv.innerHTML = '<div class="forecast-card">Failed to load forecast.</div>';
  }
}

// Show alerts and forecast when navigating to Alerts screen
const alertsBtn = document.querySelectorAll('[onclick*="alertsScreen"]');
alertsBtn.forEach(btn => btn.addEventListener('click', () => {
  loadMyWeatherAlerts();
  loadMyWeatherForecast();
}));

// Listen for state dropdown changes
const stateSelect = document.getElementById('stateSelect');
if (stateSelect) {
  stateSelect.addEventListener('change', () => {
    loadMyWeatherAlerts();
    loadMyWeatherForecast();
  });
}

// Fetch and display rewards points
async function loadRewards() {
  // Simulate farmerId (replace with real auth/session logic as needed)
  const farmerId = 'test-farmer';
  const pointsDiv = document.getElementById('rewardsPoints');
  const lastLoggedDiv = document.getElementById('rewardsLastLogged');
  pointsDiv.textContent = '...';
  lastLoggedDiv.textContent = '';
  try {
    const res = await fetch(`/rewards/${farmerId}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    pointsDiv.textContent = data.points || 0;
    lastLoggedDiv.textContent = data.last_logged ? `Last log: ${new Date(data.last_logged).toLocaleString()}` : '';
    // --- Grant Strength Bar Logic ---
    const points = data.points || 0;
    const bar = document.getElementById('grantStrengthBar');
    const label = document.getElementById('grantStatusLabel');
    const partitions = Math.min(Math.floor(points / 100), 10); // 0-10
    const percent = (partitions * 10);
    bar.style.width = percent + '%';
    if (partitions >= 9) {
      label.textContent = 'Almost eligible for loan!';
    } else {
      const next = (partitions + 1) * 100;
      label.textContent = `${next - points} points to next level`;
    }
    bar.setAttribute('aria-valuenow', percent);
    bar.setAttribute('aria-valuemax', 100);
    bar.setAttribute('aria-valuemin', 0);
    bar.textContent = `${partitions}/10`;
  } catch (err) {
    pointsDiv.textContent = '0';
    lastLoggedDiv.textContent = '';
    // Reset bar if error
    const bar = document.getElementById('grantStrengthBar');
    const label = document.getElementById('grantStatusLabel');
    if (bar) bar.style.width = '0%';
    if (label) label.textContent = '';
  }
}

// Show rewards when navigating to Rewards screen
const rewardsBtn = document.querySelectorAll('[onclick*="rewardsScreen"]');
rewardsBtn.forEach(btn => btn.addEventListener('click', loadRewards));

// Initial setup
setTodayDate();
renderActivities('all');

// Default to dashboard
showScreen('dashboardScreen');

async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Transcription failed');
    }

    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    let errorMessage = error.message;
    
    // Check if the error is about file format
    if (errorMessage.includes('Unsupported file format')) {
      errorMessage = 'Please use one of these formats: ' + 
        ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'].join(', ');
    }
    
    throw new Error(errorMessage);
  }
}

// Handle log activity form submission
const logActivityForm = document.getElementById('logActivityForm');
if (logActivityForm) {
  logActivityForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const cropType = document.getElementById('cropType').value;
    const quantity = document.getElementById('quantity').value;
    const notes = document.getElementById('notes').value;
    const msgDiv = document.getElementById('logActivityMsg');
    msgDiv.textContent = 'Saving...';
    try {
      const res = await fetch('/api/farmer/test-farmer/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropType, quantity, notes })
      });
      const data = await res.json();
      if (data.success) {
        msgDiv.textContent = 'Activity logged!';
        logActivityForm.reset();
        // Also clear audio input and transcribe result on form reset
        const audioInput = document.getElementById('audioInput');
        const transcribeResult = document.getElementById('transcribeResult');
        if (audioInput) audioInput.value = '';
        if (transcribeResult) transcribeResult.textContent = '';
        loadRewards(); // update points
      } else {
        msgDiv.textContent = data.error || 'Failed to log activity.';
      }
    } catch (err) {
      msgDiv.textContent = 'Failed to log activity.';
    }
  });
}

// QR code generation for Profile screen
function showQRCode() {
  const qrDiv = document.getElementById('qrCode');
  qrDiv.innerHTML = '';
  // Use your actual deployed URL in production
  const url = window.location.origin + '/farmer/test-farmer';
  if (window.QRCode) {
    new QRCode(qrDiv, {
      text: url,
      width: 128,
      height: 128
    });
  } else {
    qrDiv.textContent = url;
  }
}

// Show QR code when navigating to Profile screen
const profileBtn = document.querySelectorAll('[onclick*="profileScreen"]');
profileBtn.forEach(btn => btn.addEventListener('click', showQRCode));

// --- Community Alerts Logic ---
let communityAlertRotationTimer = null;
let currentCommunityAlertIndex = 0;

async function loadCommunityAlerts() {
  const state = document.getElementById('stateSelect')?.value || '';
  const listDiv = document.getElementById('communityAlertsList');
  listDiv.innerHTML = 'Loading...';
  try {
    const res = await fetch('/api/community-alerts' + (state ? `?state=${encodeURIComponent(state)}` : ''));
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      let showAlert = (idx) => {
        const a = data[idx];
        listDiv.style.opacity = 0;
        setTimeout(() => {
          listDiv.innerHTML = `
            <div class="community-alert-card">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-secondary">${a.type}</span>
                <small class="text-muted">${a.state || 'All Malaysia'}</small>
              </div>
              <div>${a.message}</div>
              ${a.province ? `<div class='province mt-1'>Daerah: ${a.province}</div>` : ''}
              ${a.contact ? `<div class='contact mt-1'>Contact: ${a.contact}</div>` : ''}
              <div class="date mt-1">${new Date(a.createdAt).toLocaleString()}</div>
            </div>
          `;
          listDiv.style.transition = 'opacity 0.5s';
          listDiv.style.opacity = 1;
        }, 400);
      };
      if (communityAlertRotationTimer) clearInterval(communityAlertRotationTimer);
      currentCommunityAlertIndex = 0;
      listDiv.style.transition = 'opacity 0.5s';
      listDiv.style.opacity = 1;
      showAlert(currentCommunityAlertIndex);
      if (data.length > 1) {
        communityAlertRotationTimer = setInterval(() => {
          listDiv.style.transition = 'opacity 0.5s';
          listDiv.style.opacity = 0;
          setTimeout(() => {
            currentCommunityAlertIndex = (currentCommunityAlertIndex + 1) % data.length;
            showAlert(currentCommunityAlertIndex);
          }, 400);
        }, 4000);
      }
    } else {
      listDiv.innerHTML = '<div class="community-alert-card text-center text-muted">No community alerts.</div>';
      if (communityAlertRotationTimer) clearInterval(communityAlertRotationTimer);
    }
  } catch (err) {
    listDiv.innerHTML = '<div class="community-alert-card text-danger">Failed to load community alerts.</div>';
    if (communityAlertRotationTimer) clearInterval(communityAlertRotationTimer);
  }
}

const alertsScreenBtn = document.querySelectorAll('[onclick*="alertsScreen"]');
alertsScreenBtn.forEach(btn => btn.addEventListener('click', () => {
  loadMyWeatherAlerts();
  loadMyWeatherForecast();
  loadCommunityAlerts();
}));

if (stateSelect) {
  stateSelect.addEventListener('change', () => {
    loadMyWeatherAlerts();
    loadMyWeatherForecast();
    loadCommunityAlerts();
  });
}

const submitAlertForm = document.getElementById('submitAlertForm');
if (submitAlertForm) {
  submitAlertForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const type = document.getElementById('alertType').value;
    const message = document.getElementById('alertMessage').value;
    const state = document.getElementById('alertState').value;
    const province = document.getElementById('alertProvince').value;
    const contact = document.getElementById('alertContact').value;
    const msgDiv = document.getElementById('submitAlertMsg');
    msgDiv.textContent = 'Submitting...';
    try {
      const res = await fetch('/api/community-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, state, province, contact, userId: 'test-farmer' })
      });
      const data = await res.json();
      if (data.success) {
        msgDiv.textContent = 'Alert submitted!';
        submitAlertForm.reset();
        loadCommunityAlerts();
        setTimeout(() => {
          msgDiv.textContent = '';
          // Hide modal (Bootstrap 5)
          const modal = bootstrap.Modal.getInstance(document.getElementById('submitAlertModal'));
          if (modal) modal.hide();
        }, 1000);
      } else {
        msgDiv.textContent = data.error || 'Failed to submit alert.';
      }
    } catch (err) {
      msgDiv.textContent = 'Failed to submit alert.';
    }
  });
}

// Handle Transcribe button click
const transcribeBtn = document.getElementById('transcribeBtn');
const audioInput = document.getElementById('audioInput');
const transcribeResult = document.getElementById('transcribeResult');

if (transcribeBtn && audioInput && transcribeResult) {
  transcribeBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    transcribeResult.textContent = 'Transcribing...';
    if (!audioInput.files || audioInput.files.length === 0) {
      transcribeResult.textContent = 'Please select an audio file.';
      return;
    }
    const file = audioInput.files[0];
    try {
      const formData = new FormData();
      formData.append('audio', file, file.name);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Transcription failed');
      }

      transcribeResult.textContent = data.text;
    } catch (error) {
      transcribeResult.textContent = 'Error: ' + error.message;
    }
  });
}

const micBtn = document.getElementById('micBtn');
const micStatus = document.getElementById('micStatus');
const notesInput = document.getElementById('notes');

let mediaRecorder;
let audioChunks = [];
let recording = false;

if (micBtn && micStatus && notesInput && transcribeResult) {
  micBtn.addEventListener('mousedown', startRecording);
  micBtn.addEventListener('touchstart', startRecording);

  micBtn.addEventListener('mouseup', stopRecording);
  micBtn.addEventListener('mouseleave', stopRecording);
  micBtn.addEventListener('touchend', stopRecording);

  async function startRecording(e) {
    e.preventDefault();
    if (recording) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micStatus.textContent = "Mic not supported in this browser.";
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        micStatus.textContent = "Processing...";
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.details || data.error || 'Transcription failed');
          transcribeResult.textContent = data.text;
          micStatus.textContent = "Done!";
        } catch (err) {
          transcribeResult.textContent = 'Error: ' + err.message;
          micStatus.textContent = "Error";
        }
        setTimeout(() => { micStatus.textContent = ""; }, 2000);
      };
      mediaRecorder.start();
      recording = true;
      micStatus.textContent = "Recording... Release to stop.";
      micBtn.classList.add('btn-danger');
    } catch (err) {
      micStatus.textContent = "Mic error: " + err.message;
    }
  }

  function stopRecording(e) {
    if (!recording) return;
    recording = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      micBtn.classList.remove('btn-danger');
      micStatus.textContent = "Processing...";
    }
  }
}

// Add to your app.js
class WeatherAnalysis {
    constructor() {
        this.weatherData = null;
        this.cropData = {
            'Padi': { minTemp: 20, maxTemp: 35, idealRainfall: 100 },
            'Sawit': { minTemp: 24, maxTemp: 32, idealRainfall: 150 },
            'Getah': { minTemp: 22, maxTemp: 30, idealRainfall: 120 }
            // Add more crops as needed
        };
    }

    async analyzeWeatherForCrop(cropType, location) {
        const forecast = await this.getWeatherForecast(location);
        return this.generateCropRecommendations(cropType, forecast);
    }

    generateCropRecommendations(cropType, forecast) {
        const crop = this.cropData[cropType];
        const recommendations = [];

        // Temperature Analysis
        if (forecast.temperature > crop.maxTemp) {
            recommendations.push({
                type: 'warning',
                message: 'High temperature alert: Consider additional irrigation'
            });
        }

        // Rainfall Analysis
        if (forecast.rainfall < crop.idealRainfall * 0.5) {
            recommendations.push({
                type: 'warning',
                message: 'Low rainfall alert: Irrigation recommended'
            });
        }

        // Wind Analysis
        if (forecast.windSpeed > 30) {
            recommendations.push({
                type: 'warning',
                message: 'Strong winds expected: Protect crops'
            });
        }

        return recommendations;
    }
}

const sendSmsBtn = document.getElementById('sendSmsBtn');
const smsPhone = document.getElementById('smsPhone');
const smsStatus = document.getElementById('smsStatus');

if (sendSmsBtn && smsPhone && smsStatus) {
  sendSmsBtn.addEventListener('click', async () => {
    const phone = smsPhone.value.trim();
    if (!phone) {
      smsStatus.textContent = 'Please enter a phone number.';
      return;
    }
    smsStatus.textContent = 'Sending...';
    // You can customize the message or use the latest weather warning
    const message = 'Amaran Cuaca: Ramalan hujan lebat berterusan. Keadaan ini boleh menyebabkan risiko banjir atau tanah lembap berlebihan, merosakkan akar & pertumbuhan tanaman. Mohon periksa kebun & saliran air.';
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, body: message })
      });
      const data = await res.json();
      if (data.success) {
        smsStatus.textContent = 'SMS sent!';
      } else {
        smsStatus.textContent = 'Failed to send SMS: ' + (data.error || 'Unknown error');
      }
    } catch (err) {
      smsStatus.textContent = 'Failed to send SMS: ' + err.message;
    }
  });
}

// Tanya TanamAI Chatbot logic
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotMicBtn = document.getElementById('chatbotMicBtn');
let chatbotRecording = false;
let chatbotMediaRecorder;
let chatbotAudioChunks = [];

if (chatbotForm && chatbotInput && chatbotMessages) {
  chatbotForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const userMsg = chatbotInput.value.trim();
    if (!userMsg) return;
    // Display user message
    chatbotMessages.innerHTML += `<div class='chatbot-bubble chatbot-user'>${userMsg}</div><div style='clear:both'></div>`;
    chatbotInput.value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    // Call backend
    try {
      const res = await fetch('/api/tanya-tanamai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      if (data && data.reply) {
        chatbotMessages.innerHTML += `<div class='chatbot-bubble chatbot-bot'>${data.reply}</div><div style='clear:both'></div>`;
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      } else {
        chatbotMessages.innerHTML += `<div class='chatbot-bubble chatbot-bot'>TanamAI: Ralat pelayan.</div><div style='clear:both'></div>`;
      }
    } catch (err) {
      chatbotMessages.innerHTML += `<div class='chatbot-bubble chatbot-bot'>TanamAI: Tidak dapat berhubung ke pelayan.</div><div style='clear:both'></div>`;
    }
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  });

  // Voice-to-text for chatbot
  if (chatbotMicBtn && chatbotInput) {
    chatbotMicBtn.addEventListener('mousedown', startChatbotRecording);
    chatbotMicBtn.addEventListener('touchstart', startChatbotRecording);
    chatbotMicBtn.addEventListener('mouseup', stopChatbotRecording);
    chatbotMicBtn.addEventListener('mouseleave', stopChatbotRecording);
    chatbotMicBtn.addEventListener('touchend', stopChatbotRecording);

    async function startChatbotRecording(e) {
      e.preventDefault();
      if (chatbotRecording) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        chatbotMicBtn.classList.add('btn-danger');
        chatbotMicBtn.title = 'Mikrofon tidak disokong';
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chatbotMediaRecorder = new MediaRecorder(stream);
        chatbotAudioChunks = [];
        chatbotMediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) chatbotAudioChunks.push(event.data);
        };
        chatbotMediaRecorder.onstop = async () => {
          chatbotMicBtn.classList.remove('btn-danger');
          chatbotMicBtn.textContent = '';
          chatbotMicBtn.innerHTML = '<i class="bi bi-mic"></i>';
          chatbotMicBtn.title = 'Rakaman suara';
          const audioBlob = new Blob(chatbotAudioChunks, { type: 'audio/webm' });
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'rakaman.webm');
            chatbotMicBtn.innerHTML = '<i class="bi bi-hourglass"></i>';
            chatbotMicBtn.title = 'Sedang transkripsi...';
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.details || data.error || 'Transkripsi gagal');
            chatbotInput.value = data.text;
            chatbotMicBtn.innerHTML = '<i class="bi bi-mic"></i>';
            chatbotMicBtn.title = 'Rakaman suara';
          } catch (err) {
            chatbotMicBtn.innerHTML = '<i class="bi bi-mic"></i>';
            chatbotMicBtn.title = 'Transkripsi gagal';
          }
        };
        chatbotMediaRecorder.start();
        chatbotRecording = true;
        chatbotMicBtn.classList.add('btn-danger');
        chatbotMicBtn.innerHTML = '<i class="bi bi-mic-fill"></i> Merakam...';
        chatbotMicBtn.title = 'Merakam... Lepaskan untuk hantar';
      } catch (err) {
        chatbotMicBtn.classList.add('btn-danger');
        chatbotMicBtn.title = 'Ralat mikrofon';
      }
    }

    function stopChatbotRecording(e) {
      if (!chatbotRecording) return;
      chatbotRecording = false;
      if (chatbotMediaRecorder && chatbotMediaRecorder.state !== 'inactive') {
        chatbotMediaRecorder.stop();
      }
    }
  }
}

// Dummy market price data
const marketPrices = {
  sayur: [
    { nama: 'Cili Merah', harga: 6.5, daerah: 'Pendang', kemaskini: '2025-05-14' },
    { nama: 'Tomato', harga: 3.2, daerah: 'Kuala Kangsar', kemaskini: '2025-05-14' },
    { nama: 'Timun', harga: 2.8, daerah: 'Batu Pahat', kemaskini: '2025-05-14' },
    { nama: 'Kobis', harga: 2.5, daerah: 'Cameron Highlands', kemaskini: '2025-05-14' },
    { nama: 'Sawi', harga: 2.0, daerah: 'Klang', kemaskini: '2025-05-14' },
    { nama: 'Bendi', harga: 4.1, daerah: 'Kota Bharu', kemaskini: '2025-05-14' },
    { nama: 'Bayam', harga: 2.3, daerah: 'Alor Gajah', kemaskini: '2025-05-14' },
    { nama: 'Kacang Panjang', harga: 3.7, daerah: 'Seremban', kemaskini: '2025-05-14' },
  ],
  buah: [
    { nama: 'Betik', harga: 3.0, daerah: 'Arau', kemaskini: '2025-05-14' },
    { nama: 'Durian', harga: 18.0, daerah: 'Raub', kemaskini: '2025-05-14' },
    { nama: 'Mangga', harga: 7.5, daerah: 'Teluk Intan', kemaskini: '2025-05-14' },
    { nama: 'Rambutan', harga: 4.0, daerah: 'Muar', kemaskini: '2025-05-14' },
    { nama: 'Pisang', harga: 2.2, daerah: 'Baling', kemaskini: '2025-05-14' },
    { nama: 'Nenas', harga: 3.8, daerah: 'Keningau', kemaskini: '2025-05-14' },
    { nama: 'Cempedak', harga: 5.5, daerah: 'Kuching', kemaskini: '2025-05-14' },
    { nama: 'Jambu Batu', harga: 3.3, daerah: 'Gombak', kemaskini: '2025-05-14' },
  ]
};

function renderMarketPrices(type) {
  const table = document.getElementById('marketPriceTable');
  table.innerHTML = '';
  (marketPrices[type] || []).forEach(item => {
    table.innerHTML += `<tr><td>${item.nama}</td><td>${item.harga.toFixed(2)}</td><td>${item.daerah}</td><td>${item.kemaskini}</td></tr>`;
  });
}

function renderMarketTrendSummary(type) {
  const summary = document.getElementById('marketTrendSummary');
  // Dummy static summary for now
  if (type === 'sayur') {
    summary.textContent = 'Harga sayur minggu ini stabil. Tiada kenaikan ketara.';
  } else {
    summary.textContent = 'Harga buah-buahan utama sedikit meningkat berbanding minggu lepas.';
  }
}

const marketTypeSelect = document.getElementById('marketTypeSelect');
if (marketTypeSelect) {
  marketTypeSelect.addEventListener('change', () => {
    renderMarketPrices(marketTypeSelect.value);
    renderMarketTrendSummary(marketTypeSelect.value);
  });
}

// Show market prices when navigating to Market screen
const marketBtns = document.querySelectorAll('[onclick*="marketScreen"]');
marketBtns.forEach(btn => btn.addEventListener('click', () => {
  if (marketTypeSelect) marketTypeSelect.value = 'sayur';
  renderMarketPrices('sayur');
  renderMarketTrendSummary('sayur');
}));
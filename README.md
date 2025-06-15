# TaniTech - Smart Farming Platform (Hackathon Project)

A comprehensive agricultural platform built for Malaysian farmers, focusing on accessibility, AI-powered assistance, and real-time data management.

## Features

- **USSD Menu System**
  - SMS-friendly interface in English & Bahasa Malaysia
  - Accessible on any mobile phone
  - No internet required

- **Smart Activity Tracking**
  - Crop logging with quantity tracking
  - Voice-to-text input support
  - Activity history and statistics

- **AI-Powered Assistance**
  - TanamAI Chatbot for farming advice
  - Voice message transcription
  - Natural language processing in Bahasa Malaysia

- **Weather Intelligence**
  - Real-time weather alerts from Malaysia MET
  - Location-based forecasts
  - Community weather warnings

- **Community Features**
  - Community alerts system
  - Regional notifications
  - Farmer-to-farmer communication

- **Rewards System**
  - Points-based rewards
  - Activity tracking
  - Achievement system

- **QR Code System**
  - Quick data access
  - Farmer profile sharing
  - Activity history viewing

## Tech Stack

- **Backend**
  - Node.js with Express
  - Firebase Firestore
  - OpenAI API (GPT-3.5 & Whisper)
  - Twilio API (USSD/SMS)

- **Frontend**
  - HTML/CSS/JavaScript
  - Progressive Web App (PWA)
  - Responsive design

- **AI & ML**
  - OpenAI GPT-3.5 for TanamAI chatbot
  - OpenAI Whisper for voice transcription
  - Natural language processing

- **APIs & Services**
  - Malaysia MET Weather API
  - Twilio SMS/USSD
  - Firebase Authentication
  - Firebase Cloud Firestore

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/theguyindark/Tani-Tech.git
   cd Tani-Tech
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_MESSAGING_SERVICE_SID=your_messaging_sid
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_DATABASE_URL=your_firebase_database_url
   ```

4. Firebase Setup:
   - Create a new Firebase project
   - Enable Firestore
   - Set up Firebase Authentication
   - Deploy security rules

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `/ussd` - USSD menu handler
- `/api/transcribe` - Audio transcription
- `/api/tanya-tanamai` - AI chatbot
- `/api/my-weather-alerts` - Weather alerts
- `/api/my-weather-forecast` - Weather forecasts
- `/api/community-alerts` - Community alerts
- `/api/send-sms` - SMS sending
- `/rewards/:farmerId` - Rewards system
- `/farmer/:id` - Farmer profile

## Security

- Environment variables for sensitive data
- Firebase security rules
- Rate limiting on API endpoints
- File upload restrictions
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue in the GitHub repository or contact the development team. 
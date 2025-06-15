# TaniTech Agricultural Data Wallet

A USSD-first agricultural data wallet built for Malaysian farmers, focusing on low-literacy users and offline-first functionality.

## Features

- USSD Menu System (SMS-friendly English & Bahasa Malaysia)
- Activity Logging for Crops
- Weather-based Alerts
- QR Code System for Data Access
- Offline-first Design
- Voice-to-Text Fallback

## Tech Stack

- Frontend: Twilio USSD/SMS API + Basic HTML/JS QR interface
- Backend: Firebase Firestore + Cloud Functions
- Authentication: Firebase Phone Auth
- Alerts: WeatherAPI.com Integration

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
4. Set up Firebase:
   - Create a new Firebase project
   - Enable Firestore
   - Set up Firebase Authentication with phone numbers
   - Deploy security rules

5. Set up Twilio:
   - Create a Twilio account
   - Get your USSD shortcode
   - Configure webhook URL to point to your `/ussd` endpoint

6. Start the server:
   ```bash
   npm start
   ```

## USSD Menu Structure

1. Log Activity
   - Select crop type
   - Enter quantity
   - Add notes (optional)

2. View History
   - Last 5 activities
   - Basic statistics

3. Alerts
   - Weather warnings
   - Community alerts

4. Rewards
   - Points balance
   - Available rewards

## Security

- All data is encrypted in transit
- Firebase security rules ensure data isolation
- Phone number verification required
- Rate limiting on USSD endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 
# 🚀 India Hackathon Hub - HackHub Application

A modern web application for discovering, registering, and managing hackathons across India. Built with Firebase authentication, Firestore database, and progressive web app capabilities.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Authentication & User Management
- ✅ **Email/Phone Sign-up** with OTP verification
- ✅ **Google Sign-in** integration
- ✅ **Password Reset** via email
- ✅ **Session Management** with secure token storage
- ✅ **User Profiles** with customizable information

### Hackathon Discovery
- 🔍 Browse and search hackathons
- 📌 Save favorite hackathons
- 📝 Register for events
- 🔔 Notifications for hackathon updates
- 👤 User profile management

### Progressive Web App (PWA)
- 📱 Offline-first architecture with Service Worker
- 💾 Automatic caching of app shell
- 🚀 Installable on mobile devices
- ⚡ Fast load times

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Firebase SDK** (v10.7.1)
  - Authentication
  - Firestore Database
  - Cloud Storage

### Features
- **Service Worker** for offline functionality
- **Web Manifest** for PWA installation
- **reCAPTCHA** for phone OTP verification
- **Responsive Design** with CSS variables

## 📁 Project Structure

```
Hack_Hub_Application/
├── index.html                 # Splash screen (entry point)
├── login.html                 # Authentication page
├── home.html                  # Main dashboard
├── profile.html               # User profile management
├── details.html               # Hackathon details
├── notifications.html         # User notifications
├── about.html                 # About HackHub
├── admin.html                 # Admin dashboard
├── bookmart.html              # Saved hackathons
│
├── auth.js                    # Main authentication logic
├── validation.js              # Input validation functions
├── firebase-config.js         # Firebase configuration
├── sw.js                      # Service Worker (offline support)
│
├── manifest.json              # PWA manifest
├── css/                       # Stylesheets
│   └── style.css             # Main styles (to be created)
│
├── .gitignore                 # Git ignore rules
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project account
- Internet connection

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dhanush-0303/Hack_Hub_Application.git
   cd Hack_Hub_Application
   ```

2. **Configure Firebase**
   - Copy `.env.example` to `.env`
   - Update with your Firebase credentials
   - Or update `firebase-config.js` directly

3. **Create CSS stylesheet** (if not exists)
   ```bash
   mkdir -p css
   touch css/style.css
   ```

4. **Serve the application**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```

5. **Open in browser**
   - Navigate to `http://localhost:8000`

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Get your Firebase config:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

3. Update `firebase-config.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Authentication Methods

#### Email/Phone OTP
- Sends 6-digit OTP via email or SMS
- 5-minute expiry
- Maximum 5 attempts
- Requires reCAPTCHA for phone verification

#### Google Sign-in
- Automatic profile creation
- Links Google account data
- One-click authentication

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- **NEVER commit Firebase credentials** to version control
- Use `.env` file for sensitive data
- Add `.env` to `.gitignore` (already included)
- Enable Firebase Security Rules in production
- Use reCAPTCHA v2 for bot protection

## 📱 PWA Features

### Installation
- Click install button in browser
- Add to home screen on mobile
- Works offline with cached resources

### Offline Functionality
- Service Worker caches essential assets
- Network-first strategy for updates
- Fallback to cached content when offline

## 🔄 Authentication Flow

### Sign-up Flow
1. User enters full name
2. User provides email or phone
3. System sends OTP
4. User verifies OTP
5. User sets password
6. User enters date of birth
7. Account created in Firestore

### Login Flow
1. User enters email/phone and password
2. Firebase authenticates credentials
3. Session stored in sessionStorage
4. Redirected to home page

### Google Sign-in
1. User clicks "Continue with Google"
2. Google login popup
3. Automatic account creation if new
4. Session established

## 📚 Key Functions

### Authentication (`auth.js`)
- `doLogin()` - Email/phone login
- `loginWithGoogle()` - Google authentication
- `completeSignup()` - Finish registration
- `doLogout()` - Sign out user
- `initializeSession()` - Check auth state

### Validation (`validation.js`)
- `validateName()` - Name validation
- `validateEmail()` - Email format check
- `validatePhone()` - Phone number validation
- `validatePassword()` - Password strength
- `validateOTP()` - OTP format check
- `validateDOB()` - Age verification

### Firebase (`firebase-config.js`)
- Firebase app initialization
- Auth and Firestore setup
- Language configuration

## 🐛 Troubleshooting

### Issue: reCAPTCHA not loading
- ✅ Check Firebase project has reCAPTCHA enabled
- ✅ Verify domain is added to reCAPTCHA allowlist
- ✅ Check console for script loading errors

### Issue: OTP not received
- ✅ Check Firestore phone number format
- ✅ Verify phone number starts with 6-9
- ✅ Check Firebase phone auth is enabled

### Issue: Service Worker not caching
- ✅ Check HTTPS is enabled (required for PWA)
- ✅ Clear browser cache and re-register
- ✅ Check browser DevTools > Application > Service Workers

### Issue: Firebase connection failing
- ✅ Verify API key is correct
- ✅ Check Firebase project is active
- ✅ Verify domain is authorized

## 📝 Environment Variables

Create a `.env` file (never commit):
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚢 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
firebase deploy
```

### Netlify
1. Connect GitHub repository
2. Set build command: (leave empty for static)
3. Set publish directory: `/`
4. Deploy

### Vercel
1. Import GitHub repository
2. Set build settings
3. Deploy with automatic previews

## 📄 Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Latest 2 versions |
| Firefox | ✅ Latest 2 versions |
| Safari  | ✅ Latest 2 versions |
| Edge    | ✅ Latest 2 versions |
| IE 11   | ❌ Not supported |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ES6+ syntax
- Add JSDoc comments for functions
- Follow existing code structure
- Test on multiple browsers

## 📜 License

This project is open source and available under the MIT License.

## 👨‍💼 Author

**Dhanush** - [@Dhanush-0303](https://github.com/Dhanush-0303)

## 🙏 Acknowledgments

- Firebase for backend services
- Google for authentication
- reCAPTCHA for security
- Web API standards for PWA support

## 📞 Support

For issues and questions:
- 📧 Open an issue on GitHub
- 💬 Check existing discussions
- 🐛 Report bugs with reproduction steps

---

**Last Updated:** July 2026  
**Version:** 2.0  
**Status:** Active Development

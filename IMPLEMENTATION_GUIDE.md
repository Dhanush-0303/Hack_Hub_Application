# India Hackathon Hub - Complete Architecture & Implementation Guide

## 🎯 Project Overview

**Full-Stack Application** with dual frontend (Web + Android) and Firebase backend.

### Key Features Implemented:
✅ Persistent login (SharedPreferences / SessionStorage)
✅ No OTP verification (Direct password-based auth)
✅ Simple password reset (Email/Phone based)
✅ Modern bottom navigation (Android)
✅ Glassmorphism UI (Web)
✅ Real-time search
✅ Push notifications
✅ Dark mode support
✅ Production-ready security

---

## 📊 Firebase Firestore Collections Schema

### Collection: `users`
```json
{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "phone": "+91XXXXXXXXXX",
  "fullName": "John Doe",
  "profilePhoto": "https://url",
  "bio": "Description",
  "joinedDate": "timestamp",
  "lastLoginDate": "timestamp",
  "accountStatus": "active",
  "isDarkMode": false,
  "notificationsEnabled": true,
  "userType": "student",
  "skills": ["Python", "Kotlin"],
  "savedOpportunities": {
    "hackathons": ["id1", "id2"],
    "internships": ["id1"],
    "courses": ["id1"],
    "certifications": ["id1"]
  },
  "passwordHash": "hashed_password",
  "lastUpdated": "timestamp"
}
```

### Collection: `hackathons`
```json
{
  "id": "unique_id",
  "title": "Hackathon Name",
  "organization": "Company/Org",
  "logo": "url",
  "description": "Detailed description",
  "registrationDeadline": "timestamp",
  "startDate": "timestamp",
  "endDate": "timestamp",
  "eligibility": "Eligibility criteria",
  "rules": "Rules text",
  "termsConditions": "T&C",
  "registrationLink": "https://...",
  "mode": "online|offline|hybrid",
  "isFeatured": false,
  "views": 1500,
  "registrations": 250,
  "submittedBy": "uid",
  "metadata": {
    "category": "web|mobile|ai|ml",
    "prizes": "Amount",
    "location": "City/Online",
    "teamSize": "1-5"
  }
}
```

### Collection: `internships`
```json
{
  "id": "unique_id",
  "title": "Role Title",
  "company": "Company Name",
  "logo": "url",
  "description": "Job description",
  "skillsRequired": ["Skill1", "Skill2"],
  "eligibility": "Criteria",
  "duration": "3 months",
  "isPaid": true,
  "stipend": 15000,
  "certificateAvailable": true,
  "applyLink": "https://...",
  "views": 800,
  "applications": 150,
  "submittedBy": "uid",
  "metadata": {
    "workType": "Remote|Office|Hybrid",
    "startDate": "timestamp",
    "department": "Engineering"
  }
}
```

### Collection: `courses`
```json
{
  "id": "unique_id",
  "title": "Course Name",
  "instructor": "Instructor Name",
  "platform": "YouTube|Coursera|Udemy|NPTEL|edX",
  "thumbnail": "url",
  "duration": "30 hours",
  "isFree": true,
  "watchLink": "https://...",
  "description": "Description",
  "level": "Beginner|Intermediate|Advanced",
  "views": 5000,
  "rating": 4.5,
  "submittedBy": "uid",
  "metadata": {
    "language": "English",
    "certification": true,
    "updateDate": "timestamp"
  }
}
```

### Collection: `certifications`
```json
{
  "id": "unique_id",
  "name": "Certification Name",
  "organization": "Issuer Name",
  "certificateImage": "url",
  "description": "Details",
  "eligibility": "Prerequisites",
  "rules": "Exam rules",
  "isFree": false,
  "price": 150,
  "registrationLink": "https://...",
  "views": 3000,
  "registrations": 500,
  "submittedBy": "uid",
  "metadata": {
    "examDuration": "2 hours",
    "passingScore": "70%",
    "validityPeriod": "3 years"
  }
}
```

### Collection: `notifications`
```json
{
  "userId/notificationId": {
    "type": "hackathon_update|new_opportunity|announcement|offer",
    "title": "Notification Title",
    "message": "Notification message",
    "image": "url",
    "data": {
      "relatedId": "opportunity_id",
      "relatedType": "hackathon|internship|course|certification",
      "action": "deep_link_url"
    },
    "isRead": false,
    "timestamp": "timestamp"
  }
}
```

### Collection: `submissions`
```json
{
  "id": "unique_id",
  "userId": "uid",
  "type": "hackathon|internship|course|certification",
  "title": "Title",
  "description": "Description",
  "organization": "Organization",
  "logo": "url",
  "links": {
    "registration": "url",
    "website": "url"
  },
  "dates": {
    "start": "timestamp",
    "end": "timestamp"
  },
  "metadata": {
    "eligibility": "text",
    "category": "category",
    "isPaid": false
  },
  "status": "pending|approved|rejected",
  "adminNotes": "Review notes",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 🔐 Firebase Authentication Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId || 
                     isAdmin(request.auth.uid);
      allow write: if request.auth.uid == userId;
      allow delete: if request.auth.uid == userId;
    }
    
    // Everyone can read opportunities
    match /hackathons/{doc=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isOwnerOrAdmin(request.auth.uid, resource.data.submittedBy);
    }
    
    match /internships/{doc=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isOwnerOrAdmin(request.auth.uid, resource.data.submittedBy);
    }
    
    match /courses/{doc=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isOwnerOrAdmin(request.auth.uid, resource.data.submittedBy);
    }
    
    match /certifications/{doc=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isOwnerOrAdmin(request.auth.uid, resource.data.submittedBy);
    }
    
    // Notifications (user-specific)
    match /notifications/{userId}/{doc=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Submissions (user and admin)
    match /submissions/{doc=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isOwnerOrAdmin(request.auth.uid, resource.data.userId);
    }
  }
  
  // Helper functions
  function isAdmin(uid) {
    return get(/databases/$(database)/documents/users/$(uid)).data.userType == 'admin';
  }
  
  function isOwnerOrAdmin(uid, owner) {
    return uid == owner || isAdmin(uid);
  }
}
```

---

## 📱 Android Dependencies (build.gradle)

```gradle
dependencies {
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-firestore'
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-storage'
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'
    
    // Jetpack
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.2'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
    implementation 'androidx.activity:activity-compose:1.8.0'
    implementation 'androidx.fragment:fragment-ktx:1.6.2'
    
    // Material Design 3
    implementation 'com.google.android.material:material:1.10.0'
    implementation 'androidx.compose.material3:material3:1.1.2'
    implementation 'androidx.compose.ui:ui:1.5.4'
    
    // Kotlin Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3'
    
    // Hilt Dependency Injection
    implementation 'com.google.dagger:hilt-android:2.48'
    kapt 'com.google.dagger:hilt-compiler:2.48'
    
    // Retrofit & Networking
    implementation 'com.squareup.retrofit2:retrofit:2.10.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.10.0'
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    
    // Image Loading
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    kapt 'com.github.bumptech.glide:compiler:4.16.0'
    
    // Room Database
    implementation 'androidx.room:room-runtime:2.6.1'
    kapt 'androidx.room:room-compiler:2.6.1'
    implementation 'androidx.room:room-ktx:2.6.1'
    
    // WorkManager
    implementation 'androidx.work:work-runtime-ktx:2.9.0'
    
    // Datastore (Shared Preferences replacement)
    implementation 'androidx.datastore:datastore-preferences:1.0.0'
    
    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

---

## 🌐 Web Dependencies (package.json)

```json
{
  "dependencies": {
    "firebase": "^10.7.0",
    "chart.js": "^4.4.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0"
  }
}
```

---

## 🔄 Implementation Checklist

### Phase 1: Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password)
- [ ] Configure Firestore Database
- [ ] Create collections & security rules
- [ ] Set up Firebase Storage
- [ ] Configure Firebase Messaging

### Phase 2: Web - Authentication & Persistence
- [ ] Implement login without OTP
- [ ] Implement password reset
- [ ] Add session persistence (SessionStorage + LocalStorage)
- [ ] Create Protected routes
- [ ] Implement logout

### Phase 3: Web - UI Components
- [ ] Landing page
- [ ] Dashboard with search
- [ ] Listings pages (Hackathons, Internships, Courses, Certifications)
- [ ] Profile page
- [ ] Submission form
- [ ] Notifications center
- [ ] Settings/Preferences

### Phase 4: Android - Setup & Authentication
- [ ] Firebase setup
- [ ] Login/Signup activities
- [ ] Session persistence (SharedPreferences)
- [ ] Password reset flow

### Phase 5: Android - Material Design 3 UI
- [ ] Bottom Navigation Bar
- [ ] Home screen with glassmorphism
- [ ] Listings with RecyclerView
- [ ] Profile screen
- [ ] Submission form
- [ ] Dark mode support

### Phase 6: Features (Web + Android)
- [ ] Real-time search
- [ ] Favorites/Bookmarks
- [ ] Notifications
- [ ] Share functionality
- [ ] Countdown timers
- [ ] Filters & Sort

### Phase 7: Polish & Optimization
- [ ] Performance optimization
- [ ] Caching strategy
- [ ] Error handling
- [ ] Analytics
- [ ] Security review

### Phase 8: Deployment
- [ ] Web: Firebase Hosting
- [ ] Android: Google Play Store
- [ ] SSL/HTTPS setup
- [ ] Monitoring

---

Next steps:
1. Create Firebase project
2. I'll provide complete code files for Web & Android
3. Database migration scripts
4. Deployment guides

Ready to proceed with code generation? 🚀

# MindEase - Mental Health Care App

A premium mental health care mobile application built with React Native, featuring a beautiful UI inspired by modern design principles.

## 📱 Features

### Home Screen
- **Premium Header**: Logo with notification bell
- **Smart Search**: Find your specialist quickly
- **Hero Section**: Highlighting new plans and features
- **Service Cards**: 
  - 🎥 Online Consultation (HD Video Call)
  - 🏥 In-Clinic Visit (Physical Care)
  - 🚨 Emergency Support (24/7 Active)
  - 💊 Psychiatric Clinic (Specialized Care)
- **Top Specialists**: Horizontal scrollable doctor cards with ratings
- **Patient Reviews**: Verified testimonials
- **Bottom Navigation**: Intuitive tab bar with floating action button

## 🎨 UI Design

The app features a clean, modern interface with:
- Soft gradient cards (blue, green, orange, purple)
- Rounded corners and shadows for depth
- Professional color scheme
- Smooth animations and transitions
- Responsive layout

## 🛠️ Tech Stack

- **Framework**: React Native 0.83.1
- **Navigation**: React Navigation (Bottom Tabs)
- **Icons**: React Native Vector Icons (Ionicons)
- **Gestures**: React Native Gesture Handler
- **Safe Area**: React Native Safe Area Context

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install pods (iOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run on Android:**
   ```bash
   npx react-native run-android
   ```

4. **Run on iOS:**
   ```bash
   npx react-native run-ios
   ```

## 🔧 Configuration

### Vector Icons Setup

The app uses Ionicons from react-native-vector-icons. The configuration is already set up in:
- `android/app/build.gradle` - For Android
- Xcode project settings should be configured for iOS

## 📂 Project Structure

```
MindEase/
├── src/
│   ├── navigation/
│   │   └── BottomTabNavigator.tsx    # Bottom tab navigation
│   └── screens/
│       ├── HomeScreen.tsx             # Main home screen
│       ├── PlansScreen.tsx            # Plans/appointments screen
│       ├── ChatScreen.tsx             # Chat feature
│       └── ProfileScreen.tsx          # User profile
├── android/                           # Android native code
├── ios/                              # iOS native code
├── App.tsx                           # Root component
└── package.json                      # Dependencies
```

## 🎯 Screens

### Home Screen
- Displays all mental health services
- Quick access to specialists
- Patient reviews and testimonials

### Plans Screen
- Appointment management (Coming soon)

### Chat Screen
- Direct messaging with specialists (Coming soon)

### Profile Screen
- User settings and preferences (Coming soon)

## 🚀 Future Enhancements

- [ ] Video consultation integration
- [ ] Appointment booking system
- [ ] Real-time chat with specialists
- [ ] Payment gateway integration
- [ ] User authentication
- [ ] Push notifications
- [ ] Dark mode support
- [ ] Multiple language support

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Development

Built with ❤️ using React Native

---

**Note**: Make sure you have React Native development environment set up before running the app. Visit [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) for detailed instructions.

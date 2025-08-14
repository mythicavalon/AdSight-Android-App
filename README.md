# AdSight 📊

**Privacy-First Ad Prediction Tool**

A zero-cost, fully offline React Native mobile app that predicts likely advertisements you might see on various platforms using your user-provided data. All processing happens locally on your device to ensure complete privacy.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)
![Expo](https://img.shields.io/badge/Expo-49.0-black.svg)

## 🌟 Features

### Core Functionality
- **🔒 100% Offline & Private** - All data stays on your device
- **💰 Zero Cost** - Completely free forever
- **🧠 AI-Powered Predictions** - Uses local ML for ad category predictions
- **📱 Multi-Platform Support** - Predictions for Facebook, Instagram, Google, YouTube, TikTok, LinkedIn, and Amazon
- **🎯 Personalized Insights** - Tailored predictions based on your interests and behavior

### Privacy & Security
- **No Network Connections** - Operates entirely offline
- **Local Data Storage** - All information stored on device using AsyncStorage
- **Explicit Consent** - Clear privacy explanations and user consent
- **Data Control** - Full control over your data with export and delete options

### Advanced Features
- **📊 Analytics Dashboard** - Detailed insights into prediction confidence and trends
- **🔄 Profile Updates** - Monthly reminders to refresh your data (optional)
- **📋 Multiple Data Sources** - Support for interests, search history, purchase data, and app usage
- **📈 Trend Analysis** - Visualize prediction patterns across platforms
- **💾 Data Export** - Export your predictions and analytics

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/AdSight.git
   cd AdSight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For web: `npm run web`

### Building APK

To build a standalone APK:

```bash
# Install EAS CLI if you haven't already
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for Android
eas build --platform android
```

## 📱 How It Works

### 1. Onboarding & Consent
- Welcome screen explaining AdSight's purpose
- Detailed privacy policy and explicit consent
- Clear explanation of data collection and usage

### 2. Data Input
- **Interests**: Manually add topics you're interested in
- **Ad Preferences**: Import or manually enter ad categories from platforms
- **Search History**: Add search queries for better predictions
- **Purchase History**: Include past purchases for shopping-related predictions
- **App Usage**: Optional app usage statistics (simulated for demo)

### 3. Prediction Engine
The app uses a sophisticated local prediction engine that:
- Analyzes your input data against platform-specific ad category mappings
- Applies weighted scoring based on data type and relevance
- Uses probabilistic rules to enhance prediction accuracy
- Generates confidence scores and reasoning for each prediction

### 4. Dashboard & Analytics
- **Platform Selection**: Choose any supported platform to view predictions
- **Confidence Scores**: See how confident the predictions are
- **Ad Categories**: View predicted ad categories with examples
- **Analytics**: Deep insights into prediction quality and trends

## 🏗️ Project Structure

```
AdSight/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── CustomSidebar.tsx
│   ├── data/               # JSON data files
│   │   └── adMappings.json
│   ├── screens/            # App screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── ConsentScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── DataInputScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── AnalyticsScreen.tsx
│   ├── services/           # Business logic
│   │   └── PredictionEngine.ts
│   ├── theme/              # App theming
│   │   └── theme.ts
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   └── utils/              # Utility functions
├── assets/                 # Images and static files
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── package.json
├── LICENSE
└── README.md
```

## 🔧 Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **UI Library**: React Native Paper
- **State Management**: React Hooks + AsyncStorage
- **Machine Learning**: TensorFlow.js (for future enhancements)
- **Data Storage**: AsyncStorage (local)
- **Notifications**: Expo Notifications
- **Build System**: Expo EAS Build

## 📊 Supported Platforms

AdSight provides predictions for the following platforms:

| Platform | Categories | Features |
|----------|------------|----------|
| **Facebook** | Fashion, Technology, Food, Travel, Fitness, Education | Profile-based targeting |
| **Instagram** | Fashion & Beauty, Lifestyle, Food, Travel, Fitness | Visual content focus |
| **Google Search** | Shopping, Local Services, Education, Technology, Finance | Search intent analysis |
| **YouTube** | Entertainment, Education, Technology, Lifestyle, Gaming | Video content preferences |
| **TikTok** | Trending Products, Beauty, Fashion, Food, Lifestyle | Viral content trends |
| **LinkedIn** | Professional Development, Business, Education, Finance | Career-focused targeting |
| **Amazon** | Electronics, Home & Garden, Books, Fashion, Health | Purchase history analysis |

## 🔒 Privacy Policy

AdSight is built with privacy as the core principle:

### Data Collection
- **Personal Interests**: Only what you manually provide
- **Ad Preferences**: Exported data from platforms (optional)
- **Search History**: User-provided search queries (optional)
- **Purchase History**: User-provided purchase information (optional)
- **App Usage**: Simulated data for demonstration purposes

### Data Usage
- **Prediction Generation**: To create personalized ad predictions
- **Analytics**: To provide insights into prediction quality
- **Improvement**: To enhance prediction accuracy over time

### Data Protection
- **Local Storage**: All data remains on your device
- **No Transmission**: Zero network communication for data processing
- **User Control**: Full control over data deletion and export
- **Explicit Consent**: Clear consent for all data collection

## 🤝 Contributing

We welcome contributions to AdSight! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use React Native Paper components for UI consistency
- Ensure all features work offline
- Add proper error handling
- Write clear commit messages
- Update documentation as needed

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to report bugs or request features:
- **Bug Reports**: Include device info, steps to reproduce, and expected vs actual behavior
- **Feature Requests**: Describe the feature and its use case clearly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Amal Reji Nair**

- GitHub: [@amalrejinair](https://github.com/amalrejinair)
- LinkedIn: [Amal Reji Nair](https://linkedin.com/in/amalrejinair)

## 🙏 Acknowledgments

- React Native and Expo teams for the excellent development platform
- React Native Paper for the beautiful UI components
- The open-source community for inspiration and resources

## 📊 Roadmap

- [ ] **Enhanced ML Models**: More sophisticated prediction algorithms
- [ ] **Export Formats**: PDF and CSV export options
- [ ] **Profile Comparison**: Compare multiple user profiles
- [ ] **Prediction History**: Track prediction accuracy over time
- [ ] **Custom Rules**: User-defined prediction rules
- [ ] **Platform Updates**: Support for additional platforms
- [ ] **Visualization**: Advanced charts and graphs
- [ ] **Batch Processing**: Bulk data import capabilities

---

**Built with ❤️ for Privacy** • **100% Offline** • **Zero Cost** • **Open Source**
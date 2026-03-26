# Why We Can't Use the Official Jitsi SDK Easily

Here is the technical reason:
You are building your app using **Expo Go** (the managed workflow). Expo is fantastic because it pre-compiles all the nasty native iOS and Android code for you, letting you write pure JavaScript/TypeScript.

However, the **Jitsi React Native SDK** is NOT a pure JavaScript library. It is a **native library** that requires direct modifications to:
- `android/app/src/main/AndroidManifest.xml` (for camera/mic permissions)
- `android/app/build.gradle`
- `ios/Podfile`
- `ios/YourApp/Info.plist` (for VoIP, background modes, audio, and camera tracking)

### The Problem
Because you are using Expo Go, **those native structural folders (`android/` and `ios/`) do not exist in your codebase yet.** They are hidden and managed by Expo's cloud servers. 

If we install the official Jitsi SDK, your app simple **will crash** because Expo Go doesn't know how to run Jitsi's custom C++/Java/Swift background code natively.

### What are our options?

**Option 1: Break out of Expo ("Ejecting")**
We run `npx expo prebuild`. This generates the `ios` and `android` folders and rips you out of the safe Expo Go workflow. From then on, you can't use the simple Expo Go app on your phone anymore. You must use Android Studio and Xcode to compile the app natively on your computer every time you want to test it. 
*(I highly do NOT recommend this right now, as it vastly slows down development).*

**Option 2: The Linking/WebView Approach (My recommended plan)**
We don't install the dangerous, heavy native SDK. Instead, we use your app's built-in browser capabilities (using Expo's `WebBrowser` or standard deep `Linking`). 

If a user clicks "Join Consultation", we just say:
`Linking.openURL('https://meet.jit.si/YourDoctorRoom123');`
1. If they have the Jitsi App installed on their phone, it instantly opens the call seamlessly.
2. If they don't, it securely opens the Jitsi web-call right inside your app's browser window.

This second option works perfectly, costs zero effort, and guarantees your app won't break or crash! This is what I was proposing in the implementation plan. 

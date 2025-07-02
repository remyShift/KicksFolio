#!/bin/bash

echo "🔧 Nettoyage et rebuild pour production..."

# Nettoyage complet des caches
echo "🧹 Nettoyage des caches..."
rm -rf node_modules
rm -f package-lock.json
rm -rf ios/Pods
rm -f ios/Podfile.lock
rm -rf android/.gradle
rm -rf android/app/build
rm -rf .metro-cache
rm -rf /tmp/metro-*
rm -rf /tmp/react-*

# Nettoyage des caches système
echo "🧹 Nettoyage des caches système..."
npx react-native start --reset-cache --clear-hermes-cache
watchman watch-del-all 2>/dev/null || true

# Réinstallation des dépendances
echo "📦 Réinstallation des dépendances..."
npm install

# Mise à jour des pods iOS
echo "🍎 Mise à jour des pods iOS..."
cd ios
pod deintegrate
pod install --repo-update
cd ..

# Nettoyage Android
echo "🤖 Nettoyage Android..."
cd android
./gradlew clean
cd ..

echo "✅ Nettoyage terminé !"
echo ""
echo "🚀 Pour builder en production:"
echo "   iOS: npx eas build --platform ios --clear-cache"
echo "   Android: npx eas build --platform android --clear-cache"
echo ""
echo "💡 Pensez à utiliser --clear-cache pour forcer un rebuild complet" 
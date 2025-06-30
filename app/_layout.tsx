import { Slot } from 'expo-router';
import { SessionProvider } from '@/context/authContext';
import { useFonts } from 'expo-font';
import "../global.css";
import SplashScreen from '@/components/screens/SplashScreen/SplashScreen'
import { useState, useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from 'react-native-toast-message';
import '@/locales/i18n';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { deviceLanguage } from '@/locales/i18n';
import { useCurrencyStore } from '@/store/useCurrencyStore';

const FONTS = {
    'Actonia': require('../assets/fonts/Actonia.ttf'),
    'Spacemono': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Syne-ExtraBold': require('../assets/fonts/Syne-ExtraBold.ttf'),
    'Syne-SemiBold': require('../assets/fonts/Syne-SemiBold.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
    'SpaceMono-BoldItalic': require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
} as const;

function AppContent() {
    const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
    const [fontsLoaded] = useFonts(FONTS);
    const { initializeLanguage, isInitialized: languageInitialized } = useLanguageStore();
    const { initializeUnit, isInitialized: sizeUnitInitialized } = useSizeUnitStore();
    const { initializeCurrency, isInitialized: currencyInitialized } = useCurrencyStore();

    const handleSplashScreenComplete = useCallback(() => {
        setIsSplashScreenVisible(false);
    }, []);

    useEffect(() => {
        if (!languageInitialized) {
            initializeLanguage(deviceLanguage);
        }
    }, [initializeLanguage, languageInitialized]);

    useEffect(() => {
        if (!sizeUnitInitialized && languageInitialized) {
            initializeUnit();
        }
    }, [initializeUnit, sizeUnitInitialized, languageInitialized]);

    useEffect(() => {
        if (!currencyInitialized && languageInitialized) {
            initializeCurrency();
        }
    }, [initializeCurrency, currencyInitialized, languageInitialized]);

    if (!fontsLoaded) {
        return null;
    }

    if (isSplashScreenVisible) {
        return (
            <SplashScreen 
                setIsSplashScreenVisible={handleSplashScreenComplete} 
            />
        );
    }

    return <Slot />;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
                <SessionProvider>
                    <AppContent />
                    <Toast />
                </SessionProvider>
            </KeyboardProvider>
        </GestureHandlerRootView>
    );
}

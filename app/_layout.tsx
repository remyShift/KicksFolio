import { Slot } from 'expo-router';
import { SessionProvider, useSession } from '@/context/authContext';
import { useFonts } from 'expo-font';
import "../global.css";
import SplashScreen from '@/components/screens/SplashScreen/SplashScreen'
import { useState, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    const { sessionToken, loadInitialData } = useSession();

    const handleSplashScreenComplete = useCallback(() => {
        setIsSplashScreenVisible(false);
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    if (isSplashScreenVisible) {
        return (
            <SplashScreen 
                sessionToken={sessionToken} 
                loadInitialData={loadInitialData} 
                setIsSplashScreenVisible={handleSplashScreenComplete} 
            />
        );
    }

    return <Slot />;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SessionProvider>
                <AppContent />
            </SessionProvider>
        </GestureHandlerRootView>
    );
}

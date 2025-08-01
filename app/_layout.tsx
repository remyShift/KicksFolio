import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/context/authContext';
import { useFonts } from 'expo-font';
import SplashScreen from '@/components/screens/SplashScreen/SplashScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from 'react-native-toast-message';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useSplashScreenStore } from '@/store/useSplashScreenStore';
import '@/locales/i18n';
import "../global.css";

const FONTS = {
    'Actonia': require('../assets/fonts/Actonia.ttf'),
    'Syne-ExtraBold': require('../assets/fonts/Syne-ExtraBold.ttf'),
    'Syne-SemiBold': require('../assets/fonts/Syne-SemiBold.ttf'),
    'OpenSans': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
    'OpenSans-BoldItalic': require('../assets/fonts/OpenSans-BoldItalic.ttf'),
} as const;

function AppContent() {
    const [fontsLoaded] = useFonts(FONTS);
    const { isInitializing } = useAppInitialization(fontsLoaded);
    const { isVisible } = useSplashScreenStore();

    if (!fontsLoaded) {
        return null;
    }

    if (isInitializing || isVisible) {
        return <SplashScreen />;
    }

    return <RootNavigator />;
}

function RootNavigator() {
    const { user, isLoading } = useSession();

    if (isLoading) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!user}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>

            <Stack.Protected guard={!!user}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>

        </Stack>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
                <SessionProvider>
                    <AppContent />
                    <Toast topOffset={60} />
                </SessionProvider>
            </KeyboardProvider>
        </GestureHandlerRootView>
    );
};

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
import * as Sentry from '@sentry/react-native';

const FONTS = {
    'Actonia': require('../assets/fonts/Actonia.ttf'),
    'Syne-ExtraBold': require('../assets/fonts/Syne-ExtraBold.ttf'),
    'Syne-SemiBold': require('../assets/fonts/Syne-SemiBold.ttf'),
    'OpenSans': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
    'OpenSans-BoldItalic': require('../assets/fonts/OpenSans-BoldItalic.ttf'),
} as const;

Sentry.init({
    dsn: "https://dfa508fe606834b98f99e2cab4d2a7f3@o4509663411765248.ingest.de.sentry.io/4509663416418384",
    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
    // We recommend adjusting this value in production.
    // Learn more at
    // https://docs.sentry.io/platforms/react-native/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
    // Record session replays for 100% of errors and 10% of sessions
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [Sentry.mobileReplayIntegration()],
});


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

export default Sentry.wrap(function RootLayout() {
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
});

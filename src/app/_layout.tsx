import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';

import { vexo } from 'vexo-analytics';

import SplashScreen from '@/components/screens/SplashScreen/SplashScreen';
import { SessionProvider, useSession } from '@/contexts/authContext';
import { useNotificationNavigation } from '@/hooks/notifications/useNotificationNavigation';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import '@/locales/i18n';
import { useSplashScreenStore } from '@/store/useSplashScreenStore';

import '../styles/global.css';

if (!__DEV__) {
	vexo(process.env.EXPO_PUBLIC_VEXO_API_KEY as string);
}

const FONTS = {
	Actonia: require('../assets/fonts/Actonia.ttf'),
	'Syne-ExtraBold': require('../assets/fonts/Syne-ExtraBold.ttf'),
	'Syne-SemiBold': require('../assets/fonts/Syne-SemiBold.ttf'),
	OpenSans: require('../assets/fonts/OpenSans-Regular.ttf'),
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

	useNotificationNavigation();

	if (isLoading) {
		return null;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Protected guard={!user}>
				<Stack.Screen
					name="(auth)"
					options={{
						headerShown: false,
					}}
				/>
			</Stack.Protected>

			<Stack.Screen name="share-collection/[shareToken]" />
			<Stack.Screen name="share-collection/anonymous-settings" />

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
}

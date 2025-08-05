import { Stack } from 'expo-router';

import SneakersModalWrapper from '@/src/components/screens/app/SneakersModalWrapper';
import { BugReportModal } from '@/src/components/ui/modals/BugReportModal';

export default function AppLayout() {
	return (
		<>
			<Stack
				initialRouteName="(tabs)"
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen
					name="settings"
					options={{
						animationTypeForReplace: 'push',
					}}
				/>
				<Stack.Screen
					name="edit-profile"
					options={{
						animationTypeForReplace: 'push',
					}}
				/>
				<Stack.Screen
					name="social-media"
					options={{
						animationTypeForReplace: 'push',
					}}
				/>
			</Stack>
			<SneakersModalWrapper />
			<BugReportModal />
		</>
	);
}

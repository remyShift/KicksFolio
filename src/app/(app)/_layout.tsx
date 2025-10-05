import { Stack } from 'expo-router';

import SneakersModalWrapper from '@/components/screens/app/SneakersModalWrapper';
import { BugReportModal } from '@/components/ui/modals/BugReportModal';
import { ChangelogModal } from '@/components/ui/modals/ChangelogModal';
import { useChangelog } from '@/hooks/useChangelog';

export default function AppLayout() {
	const { currentChangelog, isVisible, hideChangelog, appVersion } =
		useChangelog();

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
			{currentChangelog && (
				<ChangelogModal
					visible={isVisible}
					slides={currentChangelog.slides}
					onClose={hideChangelog}
					version={appVersion}
				/>
			)}
		</>
	);
}

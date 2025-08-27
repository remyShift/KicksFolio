import { Stack } from 'expo-router';

export default function SharedLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="[shareToken]"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}

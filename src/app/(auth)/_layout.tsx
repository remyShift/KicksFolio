import { Stack } from 'expo-router';

import { SignUpPropsProvider } from '@/contexts/signUpPropsContext';

export default function AuthLayout() {
	return (
		<SignUpPropsProvider>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen
					name="welcome"
					options={{
						animationTypeForReplace: 'pop',
					}}
				/>
				<Stack.Screen
					name="login"
					options={{
						animationTypeForReplace: 'pop',
					}}
				/>
				<Stack.Screen
					name="oauth-profile-completion"
					options={{
						animationTypeForReplace: 'push',
					}}
				/>
				<Stack.Screen
					name="forgot-password"
					options={{
						animationTypeForReplace: 'pop',
					}}
				/>
				<Stack.Screen
					name="(signup)/sign-up"
					options={{
						animationTypeForReplace: 'push',
					}}
				/>
				<Stack.Screen
					name="(signup)/sign-up-second"
					options={{
						animationTypeForReplace: 'push',
					}}
				/>
			</Stack>
		</SignUpPropsProvider>
	);
}

import { SignUpPropsProvider } from '@/context/signUpPropsContext';
import { Stack } from 'expo-router';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <SignUpPropsProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" options={{ animationTypeForReplace: 'pop' }} />
                <Stack.Screen name="forgot-password" options={{ animationTypeForReplace: 'pop' }} />
                <Stack.Screen name="(signup)/sign-up" options={{ animationTypeForReplace: 'push' }} />
                <Stack.Screen name="(signup)/sign-up-second" options={{ animationTypeForReplace: 'push' }} />
            </Stack>
        </SignUpPropsProvider>  
    );
}
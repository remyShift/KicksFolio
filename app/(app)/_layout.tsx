import { Stack } from 'expo-router';
import SneakersModalWrapper from '@/components/screens/app/SneakersModalWrapper';

export default function AppLayout() {
    return (
        <>
            <Stack 
                initialRouteName="(tabs)"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="settings" options={{ animationTypeForReplace: 'push' }} />
                <Stack.Screen name="edit-profile" options={{ animationTypeForReplace: 'push' }} />
            </Stack>
            <SneakersModalWrapper />
        </>
    );
}

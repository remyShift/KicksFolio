import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/context/authContext';
import SneakersModalWrapper from '@/components/screens/app/SneakersModalWrapper';

export default function AppLayout() {
    const { isLoading, user } = useSession();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="settings" options={{ animationTypeForReplace: 'push' }} />
            </Stack>
            <SneakersModalWrapper />
        </>
    );
}

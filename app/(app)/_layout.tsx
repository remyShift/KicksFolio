import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/context/authContext';
import { useEffect } from 'react';

export default function AppLayout() {
    const { sessionToken, isLoading, user, userCollection } = useSession();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!sessionToken || !user) {
        return <Redirect href="/login" />;
    }

    if (!userCollection || userCollection.name === '') {
        return <Redirect href="/collection" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

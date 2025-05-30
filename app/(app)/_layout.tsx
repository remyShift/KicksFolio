import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/context/authContext';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout() {
    const { sessionToken, isLoading, user, userCollection } = useSession();
    const { getUserCollection } = useAuth();
    const [isCheckingCollection, setIsCheckingCollection] = useState(true);

    useEffect(() => {
        console.log('sessionToken', sessionToken);
        console.log('user', user);
        if (user && sessionToken) {
            getUserCollection(user, sessionToken)
                .then(() => setIsCheckingCollection(false))
                .catch(() => setIsCheckingCollection(false));
        } else {
            setIsCheckingCollection(false);
        }
    }, [user, sessionToken]);

    if (isLoading || isCheckingCollection) {
        return <Text>Loading...</Text>;
    }

    if (!sessionToken || !user) {
        return <Redirect href="/login" />;
    }

    if (!userCollection && !isCheckingCollection) {
        return <Redirect href="/collection" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

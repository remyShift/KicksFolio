import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/context/authContext';
import { useEffect, useState } from 'react';

export default function AppLayout() {
    const { isLoading, user, userCollection } = useSession();
    const [isCheckingCollection, setIsCheckingCollection] = useState(true);

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                setIsCheckingCollection(false);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setIsCheckingCollection(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && userCollection !== undefined) {
            setIsCheckingCollection(false);
        }
    }, [userCollection, user]);

    if (isLoading || isCheckingCollection) {
        return <Text>Loading...</Text>;
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    if (!userCollection) {
        return <Redirect href="/collection" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

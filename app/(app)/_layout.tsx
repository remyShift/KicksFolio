import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/context/authContext';
import { useEffect, useState } from 'react';

export default function AppLayout() {
    const { sessionToken, isLoading, user, userCollection } = useSession();
    const [isCheckingCollection, setIsCheckingCollection] = useState(true);

    useEffect(() => {
        if (user && sessionToken) {
            // Si on a un utilisateur et un token, on attend que userCollection soit déterminé
            // (soit qu'il ait une valeur, soit qu'il reste null après la vérification)
            const timer = setTimeout(() => {
                setIsCheckingCollection(false);
            }, 2000); // 2 secondes maximum d'attente

            return () => clearTimeout(timer);
        } else {
            setIsCheckingCollection(false);
        }
    }, [user, sessionToken]);

    // Si userCollection change (devient non-null ou reste null après chargement), 
    // on peut arrêter la vérification
    useEffect(() => {
        if (user && sessionToken && (userCollection !== undefined)) {
            setIsCheckingCollection(false);
        }
    }, [userCollection, user, sessionToken]);

    // Si on est en train de charger ou de vérifier la collection
    if (isLoading || isCheckingCollection) {
        return <Text>Loading...</Text>;
    }

    // Si pas de session ou d'utilisateur
    if (!sessionToken || !user) {
        return <Redirect href="/login" />;
    }

    // Si pas de collection après vérification
    if (!userCollection) {
        return <Redirect href="/collection" />;
    }

    // Si tout est ok, afficher l'app
    return <Stack screenOptions={{ headerShown: false }} />;
}

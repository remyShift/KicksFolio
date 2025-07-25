import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';

export default function BackToSearchButton() {
    const handleBackPress = useCallback(() => {
        router.dismissTo('/(app)/(tabs)/search');
    }, []);

    return (
        <View>
            <Pressable 
                className="p-4 absolute left-0 -top-0 z-50"
                onPress={handleBackPress}
                testID="back-to-search-button"
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
        </View>
    );
} 
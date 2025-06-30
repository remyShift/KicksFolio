import { View, Text, Pressable, Animated } from 'react-native';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useEffect, useRef } from 'react';

interface LanguageToggleProps {
    onToggle: (newLanguage: 'en' | 'fr') => void;
    currentLanguage: 'en' | 'fr';
}

export default function LanguageToggle({ onToggle, currentLanguage }: LanguageToggleProps) {
    const translateX = useRef(new Animated.Value(currentLanguage === 'en' ? 0 : 28)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: currentLanguage === 'en' ? 4 : 28,
            useNativeDriver: true,
            damping: 15,
            stiffness: 120,
        }).start();
    }, [currentLanguage]);

    return (
        <View className="flex-row items-center gap-4">
            <Pressable
                className="w-[56px] h-7 rounded-full bg-gray-300 relative"
                onPress={() => onToggle(currentLanguage === 'en' ? 'fr' : 'en')}
            >
                <Animated.View
                    className="w-6 h-6 rounded-full bg-primary absolute top-0.5 left-0.5"
                    style={{
                        transform: [{ translateX }],
                    }}
                />
            </Pressable>
            <Text className="font-spacemono-bold">
                {currentLanguage === 'en' ? 'EN' : 'FR'}
            </Text>
        </View>
    );
} 
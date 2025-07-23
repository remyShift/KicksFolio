import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useUserSearch } from '@/hooks/useUserSearch';

interface SearchEmptyStateProps {
    isInitialState?: boolean;
}

export default function SearchEmptyState({ isInitialState = false }: SearchEmptyStateProps) {
    const { t } = useTranslation();
    const { searchTerm } = useUserSearch();

    const getDisplayContent = () => {
        if (isInitialState || searchTerm.length < 2) {
            return {
                icon: 'search' as const,
                text: t('search.placeholder')
            };
        }

        return {
            icon: 'users' as const,
            text: t('search.noResults')
        };
    };

    const { icon, text } = getDisplayContent();

    return (
        <View className="flex-1 items-center justify-center mt-20">
            <Feather name={icon} size={64} color="#ccc" />
            <Text className="font-open-sans text-lg text-gray-500 mt-4 text-center px-8">
                {text}
            </Text>
            {isInitialState && (
                <Text className="font-open-sans text-sm text-gray-400 mt-2 text-center px-8">
                    {t('search.emptyState')}
                </Text>
            )}
        </View>
    );
} 
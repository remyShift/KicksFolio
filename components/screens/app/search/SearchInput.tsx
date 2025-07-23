import React from 'react';
import { View, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    testID?: string;
}

export default function SearchInput({ value, onChangeText, testID = "search-input" }: SearchInputProps) {
    const { t } = useTranslation();

    return (
        <View className="relative">
            <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 pr-12 font-open-sans text-base"
                placeholder={t('search.inputPlaceholder')}
                value={value}
                onChangeText={onChangeText}
                autoCapitalize="none"
                autoCorrect={false}
                testID={testID}
            />
            <View className="absolute right-3 top-3">
                <Feather name="search" size={20} color="#666" />
            </View>
        </View>
    );
} 
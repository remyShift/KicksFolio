import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguageStore, Language } from '@/store/useLanguageStore';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
    const { t } = useTranslation();
    const { currentLanguage, supportedLanguages, setLanguage } = useLanguageStore();

    const handleLanguageChange = async (languageCode: string) => {
        await setLanguage(languageCode as 'en' | 'fr');
    };

    return (
        <View className="p-4">
            <Text className="text-lg font-bold text-foreground mb-4">
                {t('settings.language.title', 'Language')}
            </Text>
            
            {supportedLanguages.map((language: Language) => (
                <TouchableOpacity
                    key={language.code}
                    onPress={() => handleLanguageChange(language.code)}
                    className={`flex-row items-center justify-between p-3 rounded-lg mb-2 ${
                        currentLanguage === language.code 
                            ? 'bg-primary/10 border border-primary' 
                            : 'bg-card border border-border'
                    }`}
                >
                    <View>
                        <Text className={`text-base ${
                            currentLanguage === language.code 
                                ? 'text-primary font-semibold' 
                                : 'text-foreground'
                        }`}>
                            {language.nativeName}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                            {language.name}
                        </Text>
                    </View>
                    
                    {currentLanguage === language.code && (
                        <View className="w-4 h-4 bg-primary rounded-full" />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
} 
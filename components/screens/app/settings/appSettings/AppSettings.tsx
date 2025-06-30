import { Text, View } from "react-native";
import SettingsCategory from "../SettingsCategory";
import SettingsMenuItem from "../SettingsMenuItem";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../LanguageToggle";
import { useLanguageStore } from "@/store/useLanguageStore";
import useToast from "@/hooks/useToast";

export default function AppSettings() {
    const { t } = useTranslation();
    const { currentLanguage, setLanguage } = useLanguageStore();
    const { showSuccessToast } = useToast();

    const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
        setLanguage(newLanguage);
        showSuccessToast(
            t('settings.language.title'),
            t('settings.language.description')
        );
    };

    return (
        <SettingsCategory title={t('settings.titles.app')}>
            <SettingsMenuItem 
                icon="language-outline"
                label={t('settings.titles.language')}
                rightElement={
                    <LanguageToggle 
                        currentLanguage={currentLanguage}
                        onToggle={handleLanguageChange}
                    />
                }
                testID="language"
            />
        </SettingsCategory>
    );
}
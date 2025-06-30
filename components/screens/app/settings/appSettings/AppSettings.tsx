import { Text, View } from "react-native";
import SettingsCategory from "../shared/SettingsCategory";
import SettingsMenuItem from "../shared/SettingsMenuItem";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import SizeUnitToggle from "./SizeUnitToggle";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useSizeUnitStore } from "@/store/useSizeUnitStore";
import useToast from "@/hooks/useToast";

export default function AppSettings() {
    const { t } = useTranslation();
    const { currentLanguage, setLanguage } = useLanguageStore();
    const { currentUnit, setUnit } = useSizeUnitStore();
    const { showSuccessToast } = useToast();

    const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
        setLanguage(newLanguage);
        showSuccessToast(
            t('settings.language.title'),
            t('settings.language.description')
        );
    };

    const handleUnitChange = (newUnit: 'US' | 'EU') => {
        setUnit(newUnit);
        showSuccessToast(
            t('settings.sizeUnit.title'),
            t('settings.sizeUnit.description', { unit: newUnit })
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
            <SettingsMenuItem 
                icon="resize-outline"
                label={t('settings.titles.sizeUnit')}
                rightElement={
                    <SizeUnitToggle 
                        currentUnit={currentUnit}
                        onToggle={handleUnitChange}
                    />
                }
                testID="size-unit"
            />
        </SettingsCategory>
    );
}
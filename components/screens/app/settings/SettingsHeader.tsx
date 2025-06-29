import BackButton from '@/components/ui/buttons/BackButton'
import PageTitle from '@/components/ui/text/PageTitle'
import { router } from 'expo-router'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function SettingsHeader() {
    const { t } = useTranslation()
    return (
        <View className="flex-row justify-center h-44">
            <PageTitle content={t('settings.titles.settings')} />
            <View className="absolute top-16 left-0">
                <BackButton onPressAction={() => router.canGoBack() ? router.back() : router.push('/(app)/(tabs)/user')} />
            </View>
        </View>
    )
}

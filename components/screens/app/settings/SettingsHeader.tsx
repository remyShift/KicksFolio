import BackButton from '@/components/ui/buttons/BackButton'
import PageTitle from '@/components/ui/text/PageTitle'
import { router } from 'expo-router'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function SettingsHeader() {
    const { t } = useTranslation()

    return (
        <View className="flex-row justify-center h-20 mt-20">
            <PageTitle content={t('settings.titles.settings')} />
            <View className="absolute -top-5 -left-2">
                <BackButton onPressAction={() => router.canGoBack() ? router.back() : router.dismissTo('/(app)/(tabs)/profile')} />
            </View>
        </View>
    )
}

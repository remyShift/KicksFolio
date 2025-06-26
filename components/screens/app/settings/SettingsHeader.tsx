import BackButton from '@/components/ui/buttons/BackButton'
import PageTitle from '@/components/ui/text/PageTitle'
import { router } from 'expo-router'
import { View } from 'react-native'

export default function SettingsHeader() {
    return (
        <>
            <PageTitle content="Settings" />
            <View className="absolute top-16 left-2">
                <BackButton onPressAction={() => router.canGoBack() ? router.back() : router.push('/(app)/(tabs)/user')} />
            </View>
        </>
    )
}

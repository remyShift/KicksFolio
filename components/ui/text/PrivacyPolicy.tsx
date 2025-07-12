import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
        <View className='flex justify-center items-center bg-background pb-10'>
            <Text className='font-open-sans-bold text-xs'>{t('auth.data-privacy.title')}</Text>
            <Link href='https://remyshift.github.io/KicksFolio'>
                <LinkText className='text-primary font-open-sans-bold text-xs'>
                    {t('auth.data-privacy.privacyPolicy')}
                </LinkText>
            </Link>
        </View>
    );
}
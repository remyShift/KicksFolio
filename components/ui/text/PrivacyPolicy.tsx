import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function PrivacyPolicy() {
    return (
        <View className='flex justify-center items-center bg-background pb-10'>
            <Text className='font-spacemono-bold text-xs'>See how we handle your data</Text>
            <Link href='https://remyshift.github.io/KicksFolio/docs/index.md'>
                <Text className='text-primary font-spacemono-bold text-xs'>
                    Privacy Policy
                </Text>
            </Link>
        </View>
    );
}
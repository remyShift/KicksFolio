import { Link } from "expo-router";
import { Text } from "react-native";

export default function PrivacyPolicy() {
    return (
        <>
            <Text className='font-spacemono-bold text-xs'>See how we handle your data</Text>
            <Link href='https://remyshift.github.io/KicksFolio/docs/index.md'>
                <Text className='text-primary font-spacemono-bold text-xs'>
                    Privacy Policy
                </Text>
            </Link>
        </>
    );
}
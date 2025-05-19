import { Link } from "expo-router";
import { View, Text } from "react-native";


export default function LoginPageLink() {
    return (
        <View className='flex gap-0 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-sm'>Already have an account ?</Text>
            <Link href='/login'>
                <Text className='text-primary font-spacemono-bold text-sm'>
                    Login
                </Text>
            </Link>
        </View>
    )
}

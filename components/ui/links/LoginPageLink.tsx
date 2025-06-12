import { Link } from "expo-router";
import { View, Text } from "react-native";

interface PageLinkProps {
    href: '/login' | '/sign-up' | '/forgot-password' | '/reset-password';
    textBeforeLink?: string;
    linkText: string;
}

export default function PageLink({ href, textBeforeLink, linkText }: PageLinkProps) {
    return (
        <View className='flex flex-row gap-1 w-full justify-center items-center'>
            {textBeforeLink && <Text className='font-spacemono-bold text-sm'>{textBeforeLink}</Text>}
            <Link href={href}>
                <Text className='text-primary font-spacemono-bold text-sm'>
                    {linkText}
                </Text>
            </Link>
        </View>
    )
}

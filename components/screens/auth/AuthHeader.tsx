import BackButton from "@/components/ui/buttons/BackButton"
import PageTitle from "@/components/ui/text/PageTitle"
import { RelativePathString, router } from "expo-router"
import { View } from "react-native"

interface AuthHeaderProps {
    page: {
        title: string,
        routerBack: RelativePathString,
    }
}

export default function AuthHeader({ page }: AuthHeaderProps) {
    return (
        <View className="flex-row w-full justify-center items-center">
            <View className="absolute -top-5 -left-2">
                <BackButton onPressAction={() => router.canGoBack() ? router.back() : router.push(page.routerBack)}
                    backgroundColor='bg-transparent'
                />
            </View>
            <PageTitle content={page.title} />
        </View>
    )
}

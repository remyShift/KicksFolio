import Title from '@/components/ui/text/Title'
import { Text, View } from 'react-native'

export default function EmptyWishlistState() {
    return (
        <View className="flex-1 gap-8 items-center justify-center h-96 px-8">
            <Title content="No favorites yet" isTextCenter={true} />
            <Text className="font-spacemono text-base text-center">
                On this page you can see your wishlisted sneakers,
                go to a sneaker and add it to your wishlist by clicking the heart icon.
            </Text>  
        </View>
    )
}

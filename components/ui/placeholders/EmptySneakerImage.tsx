import { ShoeIcon } from '@/components/ui/icons/ShoeIcon'
import { View } from 'react-native'

export default function EmptySneakerImage() {
    return (
        <View className="w-1/2 h-24 bg-slate-200 rounded-md flex flex-row items-center justify-center" testID="empty-slot">
            <ShoeIcon name="shoe-sneaker" size={24} color="white" />
        </View>
    )
}

import { View, Text } from 'react-native';
import { Image } from 'expo-image';

export default function FollowerTitle({ content }: { content: string }) {
    return (
        <View className="w-full flex justify-center overflow-hidden">
            <Text className="font-syne-extrabold w-[200%] text-4xl text-primary opacity-15 absolute">
                {content.toUpperCase()}
            </Text>
            <View className="flex flex-row justify-between items-center">
                <View className="flex gap-0">
                    <Text className="font-syne-extrabold text-lg leading-none">
                        @{content}
                    </Text>
                </View>
                
                <Image source={require('@/assets/images/adaptive-icon.png')}
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: 3
                    }}
                    contentFit="contain"
                    contentPosition="center"
                    cachePolicy="memory-disk"
                    transition={200}
                />
            </View>
        </View>
    );
}
import { View, Text } from 'react-native';

export default function Title({ content, isTextCenter = false }: { content: string, isTextCenter?: boolean }) {
    return (
        <View className="w-full flex justify-center overflow-hidden px-6">
            <Text className="font-syne-extrabold w-[200%] text-4xl text-primary opacity-15 absolute">
                {content.toUpperCase()}
            </Text>
            <Text className={`font-syne-extrabold text-lg ${isTextCenter ? 'text-center' : ''}`}>
                {content}
            </Text>
        </View>
    );
}

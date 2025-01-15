import { Pressable, Text } from 'react-native';

export default function NextButton({onPressAction, content}: {onPressAction: () => void, content: string}) {
    return (
        <Pressable
            className="bg-primary py-3 px-4 rounded-md flex items-center justify-center"
            onPress={onPressAction}
        >
            <Text className="font-spacemono-bold text-base text-center text-white">
                {content}
            </Text>
            <Text className="font-bold text-base text-center text-white">
                {`>>`}
            </Text>
        </Pressable>
    );
}
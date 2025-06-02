import { Pressable, Text } from 'react-native';

export default function MainButton({content, onPressAction, backgroundColor}: {content: string, onPressAction: () => void, backgroundColor: string}) {
    return (
        <Pressable 
            className={`${backgroundColor} py-3 px-4 rounded-md w-1/2`}
            onPress={onPressAction}
        >
            <Text className="font-spacemono-bold text-lg text-center text-white">
                {content}
            </Text>
        </Pressable>
    );
}
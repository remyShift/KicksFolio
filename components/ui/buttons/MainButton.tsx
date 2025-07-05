import { Pressable, Text, View } from 'react-native';

type MainButtonProps = {
    content: string;
    onPressAction: () => void;
    backgroundColor: string;
    isDisabled?: boolean;
}

export default function MainButton({content, onPressAction, backgroundColor, isDisabled = false}: MainButtonProps) {
    return (
        <View
            className={`${backgroundColor} py-3 px-4 rounded-md w-1/2`}
            testID="main-button"
        >
            <Pressable onPress={onPressAction} disabled={isDisabled}>
                    <Text className="font-spacemono-bold text-lg text-center text-white">
                        {content}
                    </Text>
            </Pressable>
        </View>
    );
}
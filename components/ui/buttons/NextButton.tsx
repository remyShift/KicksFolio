import { Pressable, Text } from 'react-native';

export default function NextButton({onPressAction, content, disabled = false}: {onPressAction: () => void, content: string, disabled?: boolean}) {
    return (
        <Pressable
            className={`${disabled ? 'bg-gray-400' : 'bg-primary'} py-3 px-4 rounded-md flex flex-row items-center justify-between gap-2`}
            onPress={onPressAction}
            disabled={disabled}
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
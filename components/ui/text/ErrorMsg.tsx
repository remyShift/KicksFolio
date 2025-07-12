import { Text } from 'react-native';

export default function ErrorMsg({ content, display }: { content: string, display: boolean }) {
    return (
        <Text className={`text-red-500 font-open-sans-bold text-sm text-center ${display ? 'block' : 'hidden'}`}
            testID="error-message"
        >
            {content}
        </Text>
    );
}
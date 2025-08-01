import { Text } from 'react-native';

export default function ErrorMsg(props: { content: string | null | undefined, display: boolean }) {
    const { content, display } = props || {};
    
    if (!content || !display) {
        return null;
    }
    
    return (
        <Text className={`text-red-500 font-open-sans-bold text-sm text-center ${display ? 'block' : 'hidden'}`}
            testID="error-message"
        >
            {content}
        </Text>
    );
}
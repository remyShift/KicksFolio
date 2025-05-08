import { Text } from 'react-native';

export default function ErrorMsg({ content, display }: { content: string, display: boolean }) {
    return (
        <Text className={`text-red-500 font-spacemono-bold text-sm text-center ${display ? 'block' : 'hidden'}`}>
            {content}
        </Text>
    );
}
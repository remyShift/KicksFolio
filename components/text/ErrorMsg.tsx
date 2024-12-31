import { Text, View } from 'react-native';

export default function ErrorMsg({ content, display }: { content: string, display: boolean }) {
    return (
        <Text className={`text-red-500 font-spacemono-bold text-center ${display ? 'block' : 'hidden'}`}>
            {content}
        </Text>
    );
}
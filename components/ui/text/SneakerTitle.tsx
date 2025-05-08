import { Text } from 'react-native';

export default function SneakerTitle({ content }: { content: string }) {
    return <Text className="font-spacemono-bold text-xl">{content}</Text>;
}

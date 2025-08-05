import { Text } from 'react-native';

export default function SneakerTitle({ content }: { content: string }) {
	return <Text className="font-open-sans-bold text-xl">{content}</Text>;
}

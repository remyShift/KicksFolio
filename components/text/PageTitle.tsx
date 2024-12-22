import { Text } from 'react-native';

export default function PageTitle({ content }: { content: string }) {
  return <Text className="font-actonia text-5xl text-primary">{content}</Text>;
}
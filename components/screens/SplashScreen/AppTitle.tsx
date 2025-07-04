import { Text } from 'react-native';

interface AppTitleProps {
    text: string;
}

export const AppTitle = ({ text }: AppTitleProps) => {
    return (
        <Text className="text-white text-6xl font-bold font-actonia">
            {text}
        </Text>
    );
}; 
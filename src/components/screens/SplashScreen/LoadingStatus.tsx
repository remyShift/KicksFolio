import { Text } from 'react-native';

interface LoadingStatusProps {
	status: string;
}

export const LoadingStatus = ({ status }: LoadingStatusProps) => {
	return <Text className="text-white text-sm opacity-70 mt-2">{status}</Text>;
};

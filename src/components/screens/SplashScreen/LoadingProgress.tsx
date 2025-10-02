import { Text } from 'react-native';

interface LoadingProgressProps {
	progress: number;
}

export const LoadingProgress = ({ progress }: LoadingProgressProps) => {
	return (
		<Text className="text-white text-2xl font-semibold mt-6">
			{Math.round(progress)}%
		</Text>
	);
};

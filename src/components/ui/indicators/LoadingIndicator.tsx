import { Text, View } from 'react-native';

interface LoadingIndicatorProps {
	message?: string;
	size?: 'small' | 'medium' | 'large';
}

export default function LoadingIndicator({
	message = 'Chargement...',
	size = 'medium',
}: LoadingIndicatorProps) {
	const sizeClasses = {
		small: 'w-4 h-4',
		medium: 'w-6 h-6',
		large: 'w-8 h-8',
	};

	return (
		<View className="flex-1 justify-center items-center">
			<View
				className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
			/>
			{message && (
				<Text className="mt-2 text-gray-600 text-sm">{message}</Text>
			)}
		</View>
	);
}

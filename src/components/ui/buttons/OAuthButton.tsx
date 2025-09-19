import { ReactNode } from 'react';

import { Pressable, Text, View } from 'react-native';

interface OAuthButtonProps {
	onPress: () => void;
	icon: ReactNode;
	text: string;
	backgroundColor?: string;
	textColor?: string;
	borderColor?: string;
	isDisabled?: boolean;
}

export default function OAuthButton({
	onPress,
	icon,
	text,
	backgroundColor = 'bg-white',
	textColor = 'text-gray-700',
	borderColor = 'border-gray-300',
	isDisabled = false,
}: OAuthButtonProps) {
	return (
		<Pressable
			onPress={isDisabled ? undefined : onPress}
			className={`w-full px-4 py-3 rounded-lg border ${backgroundColor} ${borderColor} ${
				isDisabled ? 'opacity-50' : ''
			}`}
			style={({ pressed }) => ({
				opacity: pressed && !isDisabled ? 0.8 : 1,
			})}
		>
			<View className="flex-row items-center justify-center gap-3">
				{icon}
				<Text className={`font-medium text-base ${textColor}`}>
					{text}
				</Text>
			</View>
		</Pressable>
	);
}

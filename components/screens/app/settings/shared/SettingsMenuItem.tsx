import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Entypo, Ionicons } from '@expo/vector-icons';

interface SettingsMenuItemProps {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress?: () => void;
	color?: string;
	textColor?: string;
	testID?: string;
	rightElement?: ReactNode;
}

export default function SettingsMenuItem({
	icon,
	label,
	onPress,
	color = '#666',
	textColor,
	testID,
	rightElement,
}: SettingsMenuItemProps) {
	return (
		<TouchableOpacity
			className="w-full p-5 bg-background/100 rounded-xl"
			onPress={onPress}
			testID={`drawer-button-${testID}`}
			disabled={!onPress}
		>
			<View className="flex-row justify-between items-center">
				<View className="flex-row items-center gap-4">
					<Ionicons name={icon} size={24} color={color} />
					<Text
						className="font-open-sans-bold text-base"
						style={{
							color: textColor,
						}}
					>
						{label}
					</Text>
				</View>
				{rightElement ? (
					rightElement
				) : onPress ? (
					<Entypo
						name="chevron-small-right"
						size={24}
						color="black"
					/>
				) : null}
			</View>
		</TouchableOpacity>
	);
}

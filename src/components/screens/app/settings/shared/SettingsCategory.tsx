import { Text, View } from 'react-native';

interface SettingsCategoryProps {
	children: React.ReactNode;
	title: string;
}

export default function SettingsCategory({
	children,
	title,
}: SettingsCategoryProps) {
	return (
		<View className="gap-1">
			<Text className="text-base font-open-sans-bold text-gray-900">
				{title}
			</Text>
			<View className="justify-center items-center rounded-xl bg-background/100">
				{children}
			</View>
		</View>
	);
}

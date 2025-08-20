import { Text, View } from 'react-native';

export default function Title({
	content,
	isTextCenter = false,
	testID,
}: {
	content?: string;
	isTextCenter?: boolean;
	testID?: string;
}) {
	const displayContent = content || '';

	return (
		<View className="w-full flex justify-center overflow-hidden px-6">
			<Text className="font-syne-extrabold w-[200%] text-4xl text-primary opacity-15 absolute">
				{displayContent.toUpperCase()}
			</Text>
			<Text
				className={`font-syne-extrabold text-lg ${isTextCenter ? 'text-center' : ''}`}
				testID={`${testID}-title`}
			>
				{displayContent}
			</Text>
		</View>
	);
}

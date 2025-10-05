import { Image, Text, View } from 'react-native';

import { ChangelogSlide as ChangelogSlideType } from '@/types/changelog';

interface ChangelogSlideProps {
	item: ChangelogSlideType;
	width: number;
}

export function ChangelogSlide({ item, width }: ChangelogSlideProps) {
	return (
		<View
			style={{ width }}
			className="flex-1 items-center justify-center px-8 gap-6"
		>
			<View className="gap-4">
				<Text className="text-xl font-open-sans-bold text-center">
					{item.title}
				</Text>

				<Text className="text-base font-open-sans text-center text-gray-600 leading-6">
					{item.description}
				</Text>
			</View>

			{item.image && (
				<Image
					source={item.image}
					className="w-1/2 h-[60%] rounded-xl mb-6 border-2 border-primary"
					resizeMode="cover"
				/>
			)}
		</View>
	);
}

import { Text } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import useAnimatedButtons from '@/hooks/ui/useAnimatedButtons';

type MainButtonProps = {
	content: string;
	onPressAction: () => void;
	backgroundColor: string;
	isDisabled?: boolean;
	width?: 'full' | 'half';
	borderColor?: string;
	textColor?: string;
};

export default function MainButton({
	content,
	onPressAction,
	backgroundColor,
	borderColor,
	textColor,
	isDisabled = false,
	width = 'half',
}: MainButtonProps) {
	const { animatedStyle, gesture } = useAnimatedButtons(isDisabled);

	const borderClass = borderColor ? `border border-${borderColor}` : '';
	const textClass = textColor ? `text-${textColor}` : 'text-white';

	return (
		<Animated.View
			className={`${backgroundColor} p-2 rounded-md ${width === 'full' ? 'w-full' : 'w-1/2'} ${borderClass} ${textClass}`}
			style={animatedStyle}
			testID="main-button"
			accessibilityState={{
				disabled: isDisabled,
			}}
		>
			<GestureDetector gesture={gesture}>
				<Animated.View onTouchEnd={onPressAction}>
					<Text
						className={`font-open-sans-bold text-lg text-center ${textClass}`}
					>
						{content}
					</Text>
				</Animated.View>
			</GestureDetector>
		</Animated.View>
	);
}

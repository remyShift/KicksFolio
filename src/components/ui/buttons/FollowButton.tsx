import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

interface FollowButtonProps {
	onPressAction: () => void;
	backgroundColor: string;
	isDisabled: boolean;
	isFollowing: boolean;
	testID?: string;
}

export default function FollowButton({
	onPressAction,
	backgroundColor,
	isDisabled,
	isFollowing,
	testID,
}: FollowButtonProps) {
	const { t } = useTranslation();
	const iconName = isFollowing ? 'user-x' : 'user-check';
	const title = isFollowing
		? t('ui.buttons.unfollow')
		: t('ui.buttons.follow');
	return (
		<Pressable
			className={`${backgroundColor} p-2 rounded-md flex-row items-center justify-center gap-4 ${isDisabled ? 'opacity-50' : ''}`}
			onPress={onPressAction}
			testID={`${testID}`}
			disabled={isDisabled}
		>
			<Text className="font-open-sans-bold text-md text-white">
				{title}
			</Text>
			<Feather name={iconName} size={20} color="white" />
		</Pressable>
	);
}

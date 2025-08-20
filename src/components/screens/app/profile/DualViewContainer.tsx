import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';
import { SearchUser } from '@/types/user';
import { User } from '@/types/user';

import SneakersCardByBrand from './displayState/card/SneakersCardByBrand';
import SneakerListFactory from './displayState/list/SneakerListFactory';

interface DualViewContainerProps {
	user: User | SearchUser;
	userSneakers: Sneaker[];
	onSneakerPress?: (sneaker: Sneaker) => void;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
}

export default function DualViewContainer({
	user,
	userSneakers,
	onSneakerPress,
	refreshing,
	onRefresh,
}: DualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { openSneakerModal } = useModalContext({
		contextSneakers: userSneakers,
	});

	const isCardView = viewDisplayState === ViewDisplayState.Card;

	const handleSneakerPress = useCallback(
		(sneaker: Sneaker) => {
			if (onSneakerPress) {
				onSneakerPress(sneaker);
			} else {
				openSneakerModal(sneaker);
			}
		},
		[onSneakerPress, openSneakerModal]
	);

	const validatedProps = useMemo(() => {
		if (!userSneakers || !Array.isArray(userSneakers)) {
			return {
				userSneakers: [],
				contextUserSneakers: [],
			};
		}

		return {
			userSneakers,
			contextUserSneakers: userSneakers,
		};
	}, [userSneakers]);

	const { userSneakers: validSneakers, contextUserSneakers } = validatedProps;

	return (
		<View className="flex-1">
			{isCardView ? (
				<SneakersCardByBrand
					sneakers={validSneakers}
					onSneakerPress={handleSneakerPress}
				/>
			) : (
				<SneakerListFactory
					sneakers={validSneakers}
					userSneakers={contextUserSneakers}
					refreshing={refreshing}
					onRefresh={onRefresh}
					chunkSize={10}
					bufferSize={4}
					threshold={50}
				/>
			)}
		</View>
	);
}

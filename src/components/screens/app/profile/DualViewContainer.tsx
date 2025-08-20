import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import SneakersCardByBrandHybrid from '@/components/screens/app/profile/displayState/card/SneakersCardByBrandHybrid';
import { DISPLAY_CONFIG } from '@/components/screens/app/profile/displayState/DisplayConfig';
import SneakerListFactory from '@/components/screens/app/profile/displayState/list/SneakerListFactory';
import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';

interface DualViewContainerProps {
	user: User;
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

	const validatedSneakers = useMemo(() => {
		return userSneakers && Array.isArray(userSneakers) ? userSneakers : [];
	}, [userSneakers]);

	const { filteredAndSortedSneakers } =
		useLocalSneakerData(validatedSneakers);

	const sneakersByBrand = useMemo(() => {
		if (
			!filteredAndSortedSneakers ||
			filteredAndSortedSneakers.length === 0
		) {
			return {};
		}

		return filteredAndSortedSneakers.reduce(
			(acc, sneaker) => {
				const normalizedBrand = sneaker.brand.toLowerCase().trim();
				if (!acc[normalizedBrand]) {
					acc[normalizedBrand] = [];
				}
				acc[normalizedBrand].push(sneaker);
				return acc;
			},
			{} as Record<string, Sneaker[]>
		);
	}, [filteredAndSortedSneakers]);

	const shouldUseHybridChunking = useMemo(() => {
		return Object.values(sneakersByBrand).some(
			(sneakers) => sneakers.length >= 20
		);
	}, [sneakersByBrand]);

	return (
		<View className="flex-1">
			{isCardView ? (
				shouldUseHybridChunking ? (
					<SneakersCardByBrandHybrid
						sneakers={validatedSneakers}
						onSneakerPress={handleSneakerPress}
						{...DISPLAY_CONFIG.card}
						showOwnerInfo={false}
					/>
				) : (
					<SneakersCardByBrand
						sneakers={validatedSneakers}
						onSneakerPress={handleSneakerPress}
					/>
				)
			) : (
				<SneakerListFactory
					sneakers={validatedSneakers}
					userSneakers={userSneakers}
					refreshing={refreshing}
					onRefresh={onRefresh}
					{...DISPLAY_CONFIG.list}
				/>
			)}
		</View>
	);
}

import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import SneakersCardByBrandHybrid from '@/components/screens/app/profile/displayState/card/SneakersCardByBrandHybrid';
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

	const { filteredAndSortedSneakers } = useLocalSneakerData(validSneakers);

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
		const brandsAnalysis = Object.entries(sneakersByBrand).map(
			([normalizedBrand, sneakers]) => ({
				brand: sneakers[0]?.brand || normalizedBrand,
				normalizedBrand,
				sneakersCount: sneakers.length,
				needsChunking: sneakers.length >= 20,
			})
		);

		const hasAnyBrandNeedingChunking = brandsAnalysis.some(
			(brand) => brand.needsChunking
		);

		return hasAnyBrandNeedingChunking;
	}, [sneakersByBrand, filteredAndSortedSneakers]);

	return (
		<View className="flex-1">
			{isCardView ? (
				shouldUseHybridChunking ? (
					<SneakersCardByBrandHybrid
						sneakers={validSneakers}
						onSneakerPress={handleSneakerPress}
						chunkSize={10}
						sneakersThreshold={20}
						maxSneakersPerBrandInMemory={30}
						showOwnerInfo={false}
					/>
				) : (
					<SneakersCardByBrand
						sneakers={validSneakers}
						onSneakerPress={handleSneakerPress}
					/>
				)
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

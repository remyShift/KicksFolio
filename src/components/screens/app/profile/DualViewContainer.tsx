import { useCallback, useEffect, useMemo } from 'react';

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

interface DualViewContainerProps {
	userSneakers: Sneaker[];
	onSneakerPress?: (sneaker: Sneaker) => void;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
	onFiltersChange?: (filters: any) => void;
	isAnonymousUser?: boolean;
}

export default function DualViewContainer({
	userSneakers,
	onSneakerPress,
	onFiltersChange,
	isAnonymousUser = false,
}: DualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { filteredAndSortedSneakers } = useLocalSneakerData(
		userSneakers && Array.isArray(userSneakers) ? userSneakers : []
	);
	const { openSneakerModal } = useModalContext({
		contextSneakers: filteredAndSortedSneakers,
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

	const { filters, uniqueValues } = useLocalSneakerData(validatedSneakers);

	useEffect(() => {
		if (onFiltersChange && !isAnonymousUser) {
			onFiltersChange({ filters, uniqueValues });
		}
	}, [filters, uniqueValues, onFiltersChange, isAnonymousUser]);

	const sneakersByBrand = useMemo(() => {
		const result = validatedSneakers.reduce(
			(acc, sneaker) => {
				const normalizedBrand =
					sneaker.brand?.name?.toLowerCase().trim() || 'unknown';
				if (!acc[normalizedBrand]) {
					acc[normalizedBrand] = [];
				}
				acc[normalizedBrand].push(sneaker);
				return acc;
			},
			{} as Record<string, Sneaker[]>
		);

		return result;
	}, [validatedSneakers]);

	const shouldUseHybridChunking = useMemo(() => {
		const result = Object.values(sneakersByBrand).some(
			(sneakers) => sneakers.length >= 20
		);
		return result;
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
					chunkSize={DISPLAY_CONFIG.list.chunkSize}
					bufferSize={DISPLAY_CONFIG.list.bufferSize}
					threshold={DISPLAY_CONFIG.list.threshold}
					maxChunksInMemory={DISPLAY_CONFIG.list.maxChunksInMemory}
					onFiltersChange={onFiltersChange}
				/>
			)}
		</View>
	);
}

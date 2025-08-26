import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	Text,
	View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { FilterState, UniqueValues } from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

import FilterGroup from './FilterGroup';

interface ShareCollectionModalProps {
	isVisible: boolean;
	isLoading: boolean;
	shareUrl: string | null;
	userSneakers: Sneaker[];
	uniqueValues: UniqueValues;
	initialFilters?: FilterState;
	onClose: () => void;
	onCreateShare: (filters: FilterState) => Promise<void>;
	onCopyToClipboard: () => Promise<void>;
}

export default function ShareCollectionModal({
	isVisible,
	isLoading,
	shareUrl,
	userSneakers,
	uniqueValues,
	initialFilters,
	onClose,
	onCreateShare,
	onCopyToClipboard,
}: ShareCollectionModalProps) {
	const { t } = useTranslation();
	const [tempFilters, setTempFilters] = useState<FilterState>(
		initialFilters || {
			brands: [],
			sizes: [],
			conditions: [],
			statuses: [],
		}
	);

	useEffect(() => {
		if (isVisible && initialFilters) {
			setTempFilters(initialFilters);
		}
	}, [isVisible, initialFilters]);

	const updateTempFilter = useCallback(
		(filterType: keyof FilterState, values: string[]) => {
			setTempFilters((prev) => ({
				...prev,
				[filterType]: values,
			}));
		},
		[]
	);

	const clearFilters = useCallback(() => {
		setTempFilters({
			brands: [],
			sizes: [],
			conditions: [],
			statuses: [],
		});
	}, []);

	const handleCreateShare = useCallback(async () => {
		try {
			await onCreateShare(tempFilters);
		} catch (error) {
			Alert.alert(t('share.error.title'), t('share.error.createFailed'));
		}
	}, [tempFilters, onCreateShare, t]);

	const handleCopyToClipboard = useCallback(async () => {
		try {
			await onCopyToClipboard();
			Alert.alert(t('share.success.title'), t('share.success.copied'));
		} catch (error) {
			Alert.alert(t('share.error.title'), t('share.error.copyFailed'));
		}
	}, [onCopyToClipboard, t]);

	const hasAnyFilters = useMemo(() => {
		return (
			tempFilters.brands.length > 0 ||
			tempFilters.sizes.length > 0 ||
			tempFilters.conditions.length > 0 ||
			tempFilters.statuses.length > 0
		);
	}, [tempFilters]);

	const collectionCount = useMemo(() => {
		return userSneakers.filter((sneaker) => !sneaker.wishlist).length;
	}, [userSneakers]);

	if (!isVisible) return null;

	return (
		<Modal
			visible={isVisible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View className="flex-1 bg-background">
				<View className="flex-row items-center justify-between p-4 border-b border-gray-200">
					<Text className="text-lg font-semibold">
						{t('share.title')}
					</Text>
					<Pressable onPress={onClose}>
						<Feather name="x" size={24} color="black" />
					</Pressable>
				</View>

				<View className="flex-1 p-4">
					<Text className="text-base text-gray-600 mb-6">
						{t('share.description', { count: collectionCount })}
					</Text>

					{!shareUrl ? (
						<>
							<Text className="text-lg font-semibold mb-4">
								{t('share.filters.title')}
							</Text>

							<FilterGroup
								uniqueValues={uniqueValues}
								filters={tempFilters}
								updateFilter={updateTempFilter}
							/>

							<View className="flex-row gap-3 mt-6">
								{hasAnyFilters && (
									<Pressable
										onPress={clearFilters}
										className="flex-1 py-3 px-4 bg-gray-100 rounded-lg"
									>
										<Text className="text-center font-medium">
											{t('share.filters.clear')}
										</Text>
									</Pressable>
								)}

								<Pressable
									onPress={handleCreateShare}
									disabled={isLoading}
									className="flex-1 py-3 px-4 bg-black rounded-lg"
								>
									{isLoading ? (
										<ActivityIndicator color="white" />
									) : (
										<Text className="text-center text-white font-medium">
											{t('share.create')}
										</Text>
									)}
								</Pressable>
							</View>
						</>
					) : (
						<View className="items-center">
							<Feather
								name="check-circle"
								size={64}
								color="green"
								className="mb-4"
							/>

							<Text className="text-lg font-semibold mb-2">
								{t('share.success.created')}
							</Text>

							<Text className="text-gray-600 text-center mb-6">
								{t('share.success.description')}
							</Text>

							<View className="w-full p-4 bg-gray-100 rounded-lg mb-4">
								<Text
									className="text-sm text-gray-800"
									numberOfLines={2}
								>
									{shareUrl}
								</Text>
							</View>

							<Pressable
								onPress={handleCopyToClipboard}
								className="w-full py-3 px-4 bg-black rounded-lg"
							>
								<Text className="text-center text-white font-medium">
									{t('share.copy')}
								</Text>
							</Pressable>
						</View>
					)}
				</View>
			</View>
		</Modal>
	);
}

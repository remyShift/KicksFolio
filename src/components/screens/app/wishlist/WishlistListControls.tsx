import { View } from 'react-native';

import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import { Sneaker } from '@/types/sneaker';

import SortButtons from '../profile/displayState/list/filter/SortButtons';

interface WishlistListControlsProps {
	sneakers: Sneaker[];
}

export default function WishlistListControls({
	sneakers,
}: WishlistListControlsProps) {
	const { sortBy, sortOrder, toggleSort } = useLocalSneakerData(sneakers);

	return (
		<View className="px-4 py-2 bg-white border-b border-gray-100">
			<SortButtons
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={toggleSort}
				onToggleFilters={() => {}} // Pas de filtres pour la wishlist
			/>
		</View>
	);
}

import { useCallback, useMemo, useState } from 'react';

import { TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';

export default function ViewToggleButton() {
	const { viewDisplayState, setViewDisplayState } =
		useViewDisplayStateStore();

	const [localState, setLocalState] = useState<ViewDisplayState | null>(null);

	const isCardState = localState
		? localState === ViewDisplayState.Card
		: viewDisplayState === ViewDisplayState.Card;

	const cardButtonStyle = useMemo(
		() => ({
			backgroundColor: isCardState ? '#3b82f6' : 'transparent',
			paddingHorizontal: 16,
			paddingVertical: 8,
		}),
		[isCardState]
	);

	const listButtonStyle = useMemo(
		() => ({
			backgroundColor: !isCardState ? '#3b82f6' : 'transparent',
			paddingHorizontal: 16,
			paddingVertical: 8,
		}),
		[isCardState]
	);

	const cardIconColor = useMemo(
		() => (isCardState ? 'white' : 'gray'),
		[isCardState]
	);

	const listIconColor = useMemo(
		() => (!isCardState ? 'white' : 'gray'),
		[isCardState]
	);

	const handleCardPress = useCallback(() => {
		setLocalState(ViewDisplayState.Card);
		setViewDisplayState(ViewDisplayState.Card);
		setTimeout(() => setLocalState(null), 100);
	}, [setViewDisplayState]);

	const handleListPress = useCallback(() => {
		setLocalState(ViewDisplayState.List);
		setViewDisplayState(ViewDisplayState.List);
		setTimeout(() => setLocalState(null), 100);
	}, [setViewDisplayState]);

	return (
		<View className="flex-row bg-gray-100 rounded-lg overflow-hidden absolute right-5">
			<TouchableOpacity
				style={cardButtonStyle}
				onPress={handleCardPress}
				activeOpacity={0.7}
				hitSlop={{
					top: 10,
					bottom: 10,
					left: 10,
					right: 10,
				}}
			>
				<Ionicons name="grid" size={20} color={cardIconColor} />
			</TouchableOpacity>

			<TouchableOpacity
				style={listButtonStyle}
				onPress={handleListPress}
				activeOpacity={0.7}
				hitSlop={{
					top: 10,
					bottom: 10,
					left: 10,
					right: 10,
				}}
			>
				<Ionicons name="list" size={20} color={listIconColor} />
			</TouchableOpacity>
		</View>
	);
}

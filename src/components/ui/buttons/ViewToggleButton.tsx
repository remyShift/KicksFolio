import { TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';

export default function ViewToggleButton() {
	const { viewDisplayState, setViewDisplayState } =
		useViewDisplayStateStore();

	const isCardState = viewDisplayState === ViewDisplayState.Card;

	return (
		<View className="flex-row bg-gray-100 rounded-lg overflow-hidden absolute right-5">
			<TouchableOpacity
				className={`px-4 py-2 ${isCardState ? 'bg-primary' : 'bg-transparent'}`}
				onPress={() => setViewDisplayState(ViewDisplayState.Card)}
				activeOpacity={0.7}
				hitSlop={{
					top: 10,
					bottom: 10,
					left: 10,
					right: 10,
				}}
			>
				<Ionicons
					name="grid"
					size={20}
					color={isCardState ? 'white' : 'gray'}
				/>
			</TouchableOpacity>

			<TouchableOpacity
				className={`px-4 py-2 ${!isCardState ? 'bg-primary' : 'bg-transparent'}`}
				onPress={() => setViewDisplayState(ViewDisplayState.List)}
				activeOpacity={0.7}
				hitSlop={{
					top: 10,
					bottom: 10,
					left: 10,
					right: 10,
				}}
			>
				<Ionicons
					name="list"
					size={20}
					color={!isCardState ? 'white' : 'gray'}
				/>
			</TouchableOpacity>
		</View>
	);
}

import { View } from 'react-native';

export default function OrangeShadow() {
	return (
		<View
			style={{
				position: 'absolute',
				top: 6,
				left: 4,
				right: -4,
				bottom: -6,
				backgroundColor: '#F27329',
				borderRadius: 6,
				zIndex: -1,
			}}
		/>
	);
}

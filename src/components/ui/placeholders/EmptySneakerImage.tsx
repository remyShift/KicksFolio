import { useEffect, useState } from 'react';

import { View } from 'react-native';

import { DeviceType, getDeviceTypeAsync } from 'expo-device';

import { ShoeIcon } from '@/components/ui/icons/ShoeIcon';

export default function EmptySneakerImage() {
	const [height, setHeight] = useState('h-24');

	useEffect(() => {
		getDeviceTypeAsync().then((device) => {
			setHeight(device === DeviceType.PHONE ? 'h-24' : 'h-32');
		});
	}, []);

	return (
		<View
			className={`w-1/2 ${height} bg-slate-200 rounded-md flex flex-row items-center justify-center`}
			testID="empty-slot"
		>
			<ShoeIcon name="shoe-sneaker" size={24} color="white" />
		</View>
	);
}

import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Alert, Pressable, View } from 'react-native';

import { Image } from 'expo-image';

import { MaterialIcons } from '@expo/vector-icons';

import { useImageManager } from '@/hooks/useImageManager';

interface FormImageInputProps<T extends FieldValues> {
	name: Path<T>;
	control: Control<T>;
	size?: number;
	isRounded?: boolean;
}

const FormImageInput = <T extends FieldValues>({
	name,
	control,
	size = 128,
	isRounded = true,
}: FormImageInputProps<T>) => {
	const { showSimpleImagePicker } = useImageManager();

	const handleImagePress = (onChange: (value: string) => void) => {
		showSimpleImagePicker('profile', (uri) => {
			if (!uri) {
				Alert.alert(
					'Sorry, we need permission to access your camera/photos!'
				);
				return;
			}
			onChange(uri);
		});
	};

	return (
		<Controller
			name={name}
			control={control}
			render={({ field: { onChange, value } }) => (
				<View className="items-center gap-4">
					<Pressable
						onPress={() => handleImagePress(onChange)}
						style={{
							width: size,
							height: size,
							borderRadius: isRounded ? size / 2 : 8,
						}}
						className="bg-primary flex-row items-center justify-center overflow-hidden"
					>
						{value ? (
							<Image
								source={{
									uri: value,
								}}
								style={{
									width: '100%',
									height: '100%',
									borderRadius: isRounded ? size / 2 : 8,
								}}
								contentFit="cover"
								contentPosition="center"
								cachePolicy="memory-disk"
							/>
						) : (
							<MaterialIcons
								name="add-a-photo"
								size={32}
								color="white"
							/>
						)}
					</Pressable>
				</View>
			)}
		/>
	);
};

export default FormImageInput;

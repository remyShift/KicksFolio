import { forwardRef, RefObject, useState } from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useInputSubmit } from '@/src/hooks/form/useInputSubmit';

interface FormPasswordInputProps<T extends FieldValues> {
	name: Path<T>;
	control: Control<T>;
	label: string;
	placeholder?: string;
	onFocus?: () => void;
	onBlur?: (value: string) => Promise<void>;
	error?: string;
	getFieldError?: (fieldName: string) => string | undefined;
	nextInputRef?: RefObject<TextInput | null>;
	onSubmitEditing?: () => void;
	description?: string;
}

const FormPasswordInput = forwardRef<TextInput, FormPasswordInputProps<any>>(
	(
		{
			name,
			control,
			label,
			placeholder,
			onFocus,
			onBlur,
			error,
			getFieldError,
			nextInputRef,
			onSubmitEditing,
			description,
		},
		ref
	) => {
		const [isFocused, setIsFocused] = useState(false);
		const [isPasswordVisible, setIsPasswordVisible] = useState(false);

		return (
			<View className="w-full flex flex-col gap-2">
				<Text className="font-open-sans-bold text-lg">{label}</Text>
				{description && (
					<Text className="font-open-sans text-sm text-gray-500">
						{description}
					</Text>
				)}
				<Controller
					name={name}
					control={control}
					render={({ field: { onChange, value } }) => {
						const { handleSubmitEditing } = useInputSubmit({
							ref,
							fieldName: name,
							getFieldError: getFieldError || (() => undefined),
							nextInputRef,
							onSubmitEditing,
							setIsFocused,
							onBlur,
							value,
						});

						return (
							<View className="relative">
								<TextInput
									ref={ref}
									value={value || ''}
									onChangeText={onChange}
									onFocus={() => {
										setIsFocused(true);
										onFocus?.();
									}}
									onBlur={async () => {
										setIsFocused(false);

										if (onBlur && value) {
											await onBlur(value);
										}
									}}
									onSubmitEditing={handleSubmitEditing}
									placeholder={placeholder || label}
									placeholderTextColor="#9CA3AF"
									secureTextEntry={!isPasswordVisible}
									autoCapitalize="none"
									autoComplete="password"
									returnKeyType={
										onSubmitEditing ? 'done' : 'next'
									}
									className={`bg-white rounded-md p-3 w-full font-open-sans-bold ${
										error
											? 'border-2 border-red-500'
											: isFocused
												? 'border-2 border-orange-500'
												: ''
									}`}
								/>
								<TouchableOpacity
									onPress={() =>
										setIsPasswordVisible(!isPasswordVisible)
									}
									className="absolute right-4 top-3"
								>
									<Ionicons
										name={
											isPasswordVisible
												? 'eye-off'
												: 'eye'
										}
										size={24}
										color="#9CA3AF"
									/>
								</TouchableOpacity>
							</View>
						);
					}}
				/>
			</View>
		);
	}
);

FormPasswordInput.displayName = 'FormPasswordInput';

export default FormPasswordInput;

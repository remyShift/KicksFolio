import { useEffect } from 'react';

import { Control, Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native';

import CheckBoxInput from '@/components/ui/inputs/CheckBoxInput';
import FormSelectInput from '@/components/ui/inputs/FormSelectInput';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { SneakerFormData } from '@/validation/sneaker';
import { sneakerBrandOptions, sneakerStatusOptions } from '@/validation/utils';

interface FormFieldsProps {
	control: Control<SneakerFormData>;
	handleFieldFocus: (fieldName: keyof SneakerFormData) => void;
	validateFieldOnBlur: (
		fieldName: keyof SneakerFormData,
		value: string
	) => Promise<boolean>;
	getFieldError: (fieldName: string) => string | undefined;
	modelInputRef: React.RefObject<TextInput | null>;
	brandInputRef: React.RefObject<TextInput | null>;
	sizeInputRef: React.RefObject<TextInput | null>;
	pricePaidInputRef: React.RefObject<TextInput | null>;
	descriptionInputRef: React.RefObject<TextInput | null>;
	displayedError: string;
	setValue: (name: keyof SneakerFormData, value: any) => void;
}

export const FormFields = ({
	control,
	handleFieldFocus,
	validateFieldOnBlur,
	getFieldError,
	modelInputRef,
	brandInputRef,
	sizeInputRef,
	displayedError,
	pricePaidInputRef,
	descriptionInputRef,
	setValue,
}: FormFieldsProps) => {
	const { t } = useTranslation();
	const { currentUnit } = useSizeUnitStore();
	const getFieldErrorWrapper = (fieldName: string) => {
		return getFieldError(fieldName);
	};

	const imageError = getFieldErrorWrapper('images');

	const dsValue = useWatch({
		control,
		name: 'ds',
	});

	useEffect(() => {
		if (dsValue) {
			setValue('condition', '10');
		}
	}, [dsValue, setValue]);

	return (
		<View className="flex-1 gap-4">
			<ErrorMsg
				content={imageError || displayedError}
				display={!!(imageError || displayedError)}
			/>

			<FormTextInput
				name="model"
				control={control}
				placeholder="Air Max 1 x Patta"
				ref={modelInputRef}
				nextInputRef={brandInputRef}
				autoCapitalize="words"
				onFocus={() => handleFieldFocus('model')}
				onBlur={async (value) => {
					await validateFieldOnBlur('model', value);
				}}
				error={getFieldErrorWrapper('model')}
				getFieldError={getFieldErrorWrapper}
				testID="model"
			/>

			<View className="flex flex-row gap-1" style={{ zIndex: 10 }}>
				<FormSelectInput
					name="brand"
					control={control}
					placeholder={t('collection.modal.form.placeholders.brand')}
					options={sneakerBrandOptions}
					onFocus={() => handleFieldFocus('brand')}
					error={getFieldErrorWrapper('brand')}
					testID="brand"
				/>

				<FormSelectInput
					name="status"
					control={control}
					placeholder={t('collection.modal.form.placeholders.status')}
					options={sneakerStatusOptions}
					onFocus={() => handleFieldFocus('status')}
					error={getFieldErrorWrapper('status')}
					testID="status"
				/>
			</View>

			<View>
				<View className="w-full flex-row items-center gap-2">
					<View className="flex-1 items-center p-2">
						<Controller
							control={control}
							name="og_box"
							render={({ field }) => (
								<CheckBoxInput
									label="OG Box ?"
									checked={field.value || false}
									onToggle={(checked) =>
										field.onChange(checked)
									}
								/>
							)}
						/>
					</View>
					<View className="flex-1 items-center p-2">
						<Controller
							control={control}
							name="ds"
							render={({ field }) => (
								<CheckBoxInput
									label="Deadstock ?"
									checked={field.value || false}
									onToggle={(checked) =>
										field.onChange(checked)
									}
								/>
							)}
						/>
					</View>
					<View className="flex-1 items-center p-2">
						<Controller
							control={control}
							name="is_women"
							render={({ field }) => (
								<CheckBoxInput
									label="WMNS ?"
									checked={field.value || false}
									onToggle={(checked) =>
										field.onChange(checked)
									}
								/>
							)}
						/>
					</View>
				</View>

				<View className="flex-row items-center w-full border-t-2 border-gray-300">
					<View className="flex-1 flex-col items-center px-2 gap-1 border-r-2 border-gray-300">
						<Text className="text-base font-open-sans-semibold mt-2">
							{t('collection.fields.size')}*
						</Text>
						<FormTextInput
							name="size"
							control={control}
							placeholder={currentUnit === 'EU' ? '43' : '9.5'}
							ref={sizeInputRef}
							nextInputRef={pricePaidInputRef}
							keyboardType="numeric"
							onFocus={() => handleFieldFocus('size')}
							onBlur={async (value) => {
								await validateFieldOnBlur('size', value);
							}}
							error={getFieldErrorWrapper('size')}
							getFieldError={getFieldErrorWrapper}
							testID="size"
						/>
					</View>

					<View className="flex-1 flex-col items-center px-4 gap-1 border-r-2 border-gray-300">
						<Text className="text-base font-open-sans-semibold mt-2">
							{t('collection.fields.condition')}*
						</Text>
						<FormTextInput
							name="condition"
							control={control}
							placeholder="9"
							keyboardType="numeric"
							onFocus={() => handleFieldFocus('condition')}
							onBlur={async (value) => {
								await validateFieldOnBlur('condition', value);
							}}
							error={getFieldErrorWrapper('condition')}
							getFieldError={getFieldErrorWrapper}
							testID="condition"
							editable={!dsValue}
						/>
					</View>

					<View className="flex-1 flex-col items-center px-4 gap-1">
						<Text className="text-base font-open-sans-semibold mt-2">
							{t('collection.fields.price_paid')}
						</Text>
						<FormTextInput
							name="price_paid"
							control={control}
							placeholder="150€"
							ref={pricePaidInputRef}
							nextInputRef={descriptionInputRef}
							keyboardType="numeric"
							onFocus={() => handleFieldFocus('price_paid')}
							onBlur={async (value) => {
								await validateFieldOnBlur('price_paid', value);
							}}
							error={getFieldErrorWrapper('price_paid')}
							getFieldError={getFieldErrorWrapper}
							testID="price"
						/>
					</View>
				</View>
			</View>

			<FormTextInput
				name="description"
				control={control}
				placeholder={t(
					'collection.modal.form.placeholders.description'
				)}
				ref={descriptionInputRef}
				onFocus={() => handleFieldFocus('description')}
				onBlur={async (value) => {
					await validateFieldOnBlur('description', value);
				}}
				error={getFieldErrorWrapper('description')}
				getFieldError={getFieldErrorWrapper}
				multiline={true}
				scrollEnabled={true}
				textAlignVertical="top"
				testID="description"
			/>
		</View>
	);
};

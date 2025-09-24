import { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { RelativePathString, router } from 'expo-router';

import MainButton from '@/components/ui/buttons/MainButton';
import FormImageInput from '@/components/ui/inputs/FormImageInput';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useSignUpProps } from '@/contexts/signUpPropsContext';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFormController } from '@/hooks/form/useFormController';
import useToast from '@/hooks/ui/useToast';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import {
	createSignUpStep2Schema,
	SignUpStep2FormData,
} from '@/validation/auth';

import AuthHeader from '../AuthHeader';

export default function SignUpSecondForm() {
	const { t } = useTranslation();
	const { signUpProps, setSignUpProps } = useSignUpProps();
	const scrollViewRef = useRef<ScrollView>(null);
	const sizeInputRef = useRef<TextInput>(null);

	const { currentUnit } = useSizeUnitStore();
	const { signUp, errorMsg, clearError } = useAuth();
	const { showSuccessToast } = useToast();

	const {
		control,
		handleFormSubmit,
		handleFieldFocus,
		validateFieldOnBlur,
		isSubmitDisabled,
		displayedError,
		getFieldErrorWrapper,
	} = useFormController<SignUpStep2FormData>({
		schema: createSignUpStep2Schema(),
		defaultValues: {
			size: signUpProps.sneaker_size
				? String(signUpProps.sneaker_size)
				: '',
			profile_picture: signUpProps.profile_picture || '',
		},
		fieldNames: ['size'],
		enableClearError: false,
		onSubmit: async (data) => {
			const updatedSignUpProps = {
				...signUpProps,
				sneaker_size: data.size ? Number(data.size) : 0,
				profile_picture: data.profile_picture,
			};

			setSignUpProps(updatedSignUpProps);

			const success = await signUp(updatedSignUpProps);
			if (success) {
				router.replace('/(app)/(tabs)');
				showSuccessToast(
					t('auth.signUp.success'),
					t('auth.signUp.successDescription')
				);
			}
		},
	});

	return (
		<KeyboardAwareScrollView
			ref={scrollViewRef}
			className="flex-1 bg-background pt-20"
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{
				flexGrow: 1,
				padding: 8,
			}}
			bottomOffset={10}
		>
			<AuthHeader
				page={{
					title: t('auth.titles.signup'),
					routerBack:
						'/(auth)/(signup)/sign-up' as RelativePathString,
				}}
			/>
			<View className="flex-1 items-center justify-center gap-12 p-4">
				<View className="flex gap-6 justify-center items-center w-full mt-8 px-12">
					<View
						className="w-full absolute"
						style={{
							top: -50,
						}}
					>
						<ErrorMsg
							content={errorMsg || displayedError}
							display={errorMsg !== '' || displayedError !== ''}
						/>
					</View>

					<View className="flex gap-24 w-full">
						<FormImageInput
							name="profile_picture"
							control={control}
							isRounded={true}
							size={128}
							label={t('auth.form.profilePicture.label')}
						/>

						<FormTextInput
							name="size"
							control={control}
							label={`${t('auth.form.sneakerSize.label')} (${currentUnit})`}
							placeholder={currentUnit === 'EU' ? '42' : '9.5'}
							ref={sizeInputRef}
							keyboardType="numeric"
							onFocus={() => handleFieldFocus('size')}
							onBlur={async (value) => {
								await validateFieldOnBlur('size', value);
							}}
							onSubmitEditing={handleFormSubmit}
							error={getFieldErrorWrapper('size')}
							getFieldError={getFieldErrorWrapper}
						/>
					</View>

					<MainButton
						content={t('auth.buttons.signUp')}
						backgroundColor={
							isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'
						}
						onPressAction={() => {
							if (!isSubmitDisabled) {
								handleFormSubmit();
							}
						}}
						isDisabled={isSubmitDisabled}
					/>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}

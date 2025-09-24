import { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { RelativePathString } from 'expo-router';

import AuthHeader from '@/components/screens/auth/AuthHeader';
import MainButton from '@/components/ui/buttons/MainButton';
import FormImageInput from '@/components/ui/inputs/FormImageInput';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useSession } from '@/contexts/authContext';
import { useFormController } from '@/hooks/form/useFormController';
import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useSizeConversion } from '@/hooks/useSizeConversion';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import {
	createEditProfileSchema,
	EditProfileFormData,
} from '@/validation/auth';

export default function EditProfileForm() {
	const { t } = useTranslation();
	const { user, refreshUserData } = useSession();
	const { showSuccessToast, showErrorToast } = useToast();
	const { updateUser } = useAuth();
	const { convertToCurrentUnit, getOriginalUnit } = useSizeConversion();
	const scrollViewRef = useRef<ScrollView>(null);
	const usernameInputRef = useRef<TextInput>(null);
	const sizeInputRef = useRef<TextInput>(null);

	const convertedSneakerSize =
		user!.sneaker_size && user!.sneaker_size > 0
			? convertToCurrentUnit(
					user!.sneaker_size,
					getOriginalUnit(user!.sneaker_size)
				)
			: null;
	const { currentUnit } = useSizeUnitStore();

	const {
		control,
		handleFormSubmit,
		handleFieldFocus,
		validateFieldOnBlur,
		displayedError,
		isSubmitDisabled,
		getFieldErrorWrapper,
	} = useFormController<EditProfileFormData>({
		schema: createEditProfileSchema(),
		defaultValues: {
			username: user!.username || '',
			sneaker_size: convertedSneakerSize
				? convertedSneakerSize.toString()
				: currentUnit === 'EU'
					? '42'
					: '9.5',
			profile_picture: user!.profile_picture || '',
		},
		isEditForm: true,
		onSubmit: async (data) => {
			if (!user) return;
			return updateUser(user.id, {
				...data,
				sneaker_size: parseInt(data.sneaker_size),
			})
				.then((result) => {
					if (result?.user) {
						refreshUserData();
						showSuccessToast(
							t('settings.editProfile.profileUpdated'),
							t('settings.editProfile.profileUpdatedDescription')
						);
					}
				})
				.catch((error) => {
					showErrorToast(
						t('settings.editProfile.profileUpdateFailed'),
						t('settings.editProfile.profileUpdateFailedDescription')
					);
					console.error(
						'❌ EditProfileForm: Error in form submission:',
						error
					);
					throw error;
				});
		},
	});

	return (
		<KeyboardAwareScrollView
			ref={scrollViewRef}
			className="flex-1 bg-background"
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ flexGrow: 1 }}
			bottomOffset={10}
		>
			<View className="flex-1 px-4 gap-8 mt-20">
				<AuthHeader
					page={{
						title: t('settings.titles.editProfile'),
						routerBack: '/(app)/settings' as RelativePathString,
					}}
				/>

				<FormImageInput
					name="profile_picture"
					control={control}
					size={128}
					isRounded={true}
				/>

				<View className="flex flex-col gap-4 w-full justify-center items-center px-12">
					<ErrorMsg
						content={displayedError}
						display={displayedError !== ''}
					/>

					<FormTextInput
						name="username"
						control={control}
						label={t('auth.form.username.label')}
						placeholder={t('auth.form.username.placeholder')}
						ref={usernameInputRef}
						nextInputRef={sizeInputRef}
						autoComplete="username"
						maxLength={16}
						onFocus={() => handleFieldFocus('username')}
						onBlur={async (value) => {
							await validateFieldOnBlur('username', value);
						}}
						error={getFieldErrorWrapper('username')}
						getFieldError={getFieldErrorWrapper}
						accessibilityLabel="Username*"
					/>

					<FormTextInput
						name="sneaker_size"
						control={control}
						label={t('auth.form.sneakerSize.label')}
						placeholder={currentUnit === 'EU' ? '42' : '9.5'}
						ref={sizeInputRef}
						keyboardType="numeric"
						onFocus={() => handleFieldFocus('sneaker_size')}
						onBlur={async (value) => {
							await validateFieldOnBlur('sneaker_size', value);
						}}
						onSubmitEditing={handleFormSubmit}
						error={getFieldErrorWrapper('sneaker_size')}
						getFieldError={getFieldErrorWrapper}
						accessibilityLabel="Sneaker Size*"
					/>
				</View>

				<View className="flex w-full justify-center items-center">
					<MainButton
						content={t('settings.buttons.save')}
						onPressAction={() => {
							if (!isSubmitDisabled) {
								handleFormSubmit();
							}
						}}
						backgroundColor={
							isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'
						}
						isDisabled={isSubmitDisabled}
					/>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}

import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { router, useLocalSearchParams } from 'expo-router';

import MainButton from '@/components/ui/buttons/MainButton';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { useSession } from '@/contexts/authContext';
import { useFormController } from '@/hooks/form/useFormController';
import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { OAuthCompletionData } from '@/types/auth';
import {
	createOAuthCompletionSchema,
	OAuthCompletionFormData,
} from '@/validation/auth';

export default function OAuthProfileCompletionForm() {
	const { t } = useTranslation();
	const scrollViewRef = useRef<ScrollView>(null);
	const usernameInputRef = useRef<TextInput>(null);
	const firstNameInputRef = useRef<TextInput>(null);
	const lastNameInputRef = useRef<TextInput>(null);
	const sizeInputRef = useRef<TextInput>(null);

	const params = useLocalSearchParams();
	const { showSuccessToast, showErrorToast } = useToast();
	const { user } = useSession();
	const { updateUser } = useAuth();
	const { checkUsernameExists } = useAuthValidation();
	const { currentUnit } = useSizeUnitStore();

	const [isCompleting, setIsCompleting] = useState(false);

	const oauthData = {
		email: (params.email as string) || user?.email || '',
		first_name: (params.first_name as string) || user?.first_name || '',
		last_name: (params.last_name as string) || user?.last_name || '',
		profile_picture:
			(params.profile_picture as string) || user?.profile_picture || '',
		provider: (params.provider as 'google' | 'apple') || 'google',
	};

	const {
		control,
		handleFormSubmit,
		handleFieldFocus,
		validateFieldOnBlur,
		isSubmitDisabled,
		displayedError,
		getFieldErrorWrapper,
	} = useFormController<OAuthCompletionFormData>({
		schema: createOAuthCompletionSchema(),
		defaultValues: {
			username: '',
			first_name: oauthData.first_name || '',
			last_name: oauthData.last_name || '',
			sneaker_size: currentUnit === 'EU' ? '42' : '9.5',
			profile_picture: oauthData.profile_picture,
		},
		fieldNames: ['username', 'first_name', 'last_name', 'sneaker_size'],
		asyncValidation: {
			username: checkUsernameExists,
		},
		onSubmit: async (data) => {
			if (!user?.id) return;

			setIsCompleting(true);

			try {
				await updateUser(user.id, {
					username: data.username,
					first_name: data.first_name,
					last_name: data.last_name,
					sneaker_size: Number(data.sneaker_size),
					profile_picture: data.profile_picture,
				});

				showSuccessToast(
					t('auth.oauth.completion.success'),
					t('auth.oauth.completion.successDescription')
				);

				router.replace('/(app)/(tabs)');
			} catch (error: any) {
				console.error('Error completing OAuth profile:', error);
				showErrorToast(
					t('auth.oauth.completion.error'),
					error.message || t('auth.oauth.completion.errorDescription')
				);
			} finally {
				setIsCompleting(false);
			}
		},
	});

	return (
		<KeyboardAwareScrollView
			ref={scrollViewRef}
			className="flex-1 bg-background"
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{
				flexGrow: 1,
				padding: 8,
			}}
			bottomOffset={10}
		>
			<View className="flex-1 items-center p-4 gap-12 mt-20">
				<PageTitle content={t('auth.oauth.completion.title')} />

				<View className="flex justify-center items-center gap-8 w-full mt-10 px-12">
					<View
						className="w-full absolute"
						style={{
							top: -50,
						}}
					>
						<ErrorMsg
							content={displayedError}
							display={displayedError !== ''}
						/>
					</View>

					<FormTextInput
						name="username"
						control={control}
						label={t('auth.form.username.label')}
						placeholder={t('auth.form.username.placeholder')}
						ref={usernameInputRef}
						nextInputRef={firstNameInputRef}
						autoComplete="username"
						maxLength={16}
						onFocus={() => handleFieldFocus('username')}
						onBlur={async (value) => {
							await validateFieldOnBlur('username', value);
						}}
						error={getFieldErrorWrapper('username')}
						getFieldError={getFieldErrorWrapper}
					/>

					<FormTextInput
						name="first_name"
						control={control}
						label={t('auth.form.firstName.label')}
						placeholder={t('auth.form.firstName.placeholder')}
						ref={firstNameInputRef}
						nextInputRef={lastNameInputRef}
						autoComplete="name"
						onFocus={() => handleFieldFocus('first_name')}
						onBlur={async (value) => {
							await validateFieldOnBlur('first_name', value);
						}}
						error={getFieldErrorWrapper('first_name')}
						getFieldError={getFieldErrorWrapper}
					/>

					<FormTextInput
						name="last_name"
						control={control}
						label={t('auth.form.lastName.label')}
						placeholder={t('auth.form.lastName.placeholder')}
						ref={lastNameInputRef}
						nextInputRef={sizeInputRef}
						autoComplete="name"
						onFocus={() => handleFieldFocus('last_name')}
						onBlur={async (value) => {
							await validateFieldOnBlur('last_name', value);
						}}
						error={getFieldErrorWrapper('last_name')}
						getFieldError={getFieldErrorWrapper}
					/>

					<FormTextInput
						name="sneaker_size"
						control={control}
						label={`${t('auth.form.sneakerSize.label')} (${currentUnit})`}
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
					/>

					<View className="flex gap-3 w-full justify-center items-center">
						<MainButton
							content={
								isCompleting
									? t('auth.oauth.completion.completing')
									: t('auth.oauth.completion.complete')
							}
							backgroundColor={
								isSubmitDisabled || isCompleting
									? 'bg-primary/50'
									: 'bg-primary'
							}
							onPressAction={() => {
								if (!isSubmitDisabled && !isCompleting) {
									handleFormSubmit();
								}
							}}
							isDisabled={isSubmitDisabled || isCompleting}
						/>
					</View>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}

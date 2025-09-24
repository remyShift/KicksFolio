import { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { RelativePathString, useLocalSearchParams } from 'expo-router';

import MainButton from '@/components/ui/buttons/MainButton';
import LoadingIndicator from '@/components/ui/indicators/LoadingIndicator';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useAuthValidation } from '@/hooks/auth/useAuthValidation';
import { useOAuthFormSubmission } from '@/hooks/auth/useOAuthFormSubmission';
import { useOAuthProfileCompletion } from '@/hooks/auth/useOAuthProfileCompletion';
import { useFormController } from '@/hooks/form/useFormController';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import {
	createOAuthCompletionSchema,
	OAuthCompletionFormData,
} from '@/validation/auth';

import AuthHeader from '../AuthHeader';

export default function OAuthProfileCompletionForm() {
	const { t } = useTranslation();
	const scrollViewRef = useRef<ScrollView>(null);
	const usernameInputRef = useRef<TextInput>(null);
	const sizeInputRef = useRef<TextInput>(null);

	const params = useLocalSearchParams();
	const { checkUsernameExists } = useAuthValidation();
	const { currentUnit } = useSizeUnitStore();

	// Hooks personnalisés pour séparer les responsabilités
	const { isUserLoading, user } = useOAuthProfileCompletion();

	const oauthData = {
		email: (params.email as string) || user?.email || '',
		profile_picture:
			(params.profile_picture as string) || user?.profile_picture || '',
		provider: (params.provider as 'google' | 'apple') || 'google',
	};

	const isOAuthUser =
		oauthData.provider === 'apple' || oauthData.provider === 'google';

	const { isCompleting, handleSubmit } = useOAuthFormSubmission({
		user,
		isOAuthUser,
	});

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
			sneaker_size: '',
			profile_picture: oauthData.profile_picture,
		},
		fieldNames: ['username', 'sneaker_size'],
		asyncValidation: {
			username: checkUsernameExists,
		},
		onSubmit: handleSubmit,
	});

	if (isUserLoading) {
		return (
			<View className="flex-1 bg-background">
				<LoadingIndicator
					message={t('auth.oauth.completion.loading')}
				/>
			</View>
		);
	}

	return (
		<KeyboardAwareScrollView
			ref={scrollViewRef}
			className="flex-1 bg-background pt-20"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
			scrollEnabled={false}
			contentContainerStyle={{
				flexGrow: 1,
				padding: 8,
			}}
			bottomOffset={10}
		>
			<AuthHeader
				page={{
					title: t('auth.oauth.completion.title'),
					routerBack: '/(auth)/welcome' as RelativePathString,
				}}
			/>
			<View className="flex-1 items-center justify-center p-4 gap-12">
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
						nextInputRef={sizeInputRef}
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
									? t('auth.buttons.signUp')
									: t('auth.buttons.signUp')
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

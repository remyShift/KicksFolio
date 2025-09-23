import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput } from 'react-native';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { RelativePathString, router, useLocalSearchParams } from 'expo-router';

import MainButton from '@/components/ui/buttons/MainButton';
import FormPasswordInput from '@/components/ui/inputs/FormPasswordInput';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import PageLink from '@/components/ui/links/LoginPageLink';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { useSession } from '@/contexts/authContext';
import { useFormController } from '@/hooks/form/useFormController';
import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';
import { createLoginSchema, LoginFormData } from '@/validation/auth';

import AuthHeader from '../AuthHeader';
import AuthMethodModal from '../welcome/AuthMethodModal';

export default function LoginForm() {
	const scrollViewRef = useRef<ScrollView>(null);
	const emailInputRef = useRef<TextInput>(null);
	const passwordInputRef = useRef<TextInput>(null);

	const { t } = useTranslation();

	const { login, errorMsg: authErrorMsg } = useAuth();
	const { showSuccessToast, showErrorToast } = useToast();
	const { user, isLoading } = useSession();
	const params = useLocalSearchParams();
	const [paramsMessage, setParamsMessage] = useState(
		params.message as string
	);
	const [paramsError, setParamsError] = useState(params.error as string);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);

	const {
		control,
		handleFormSubmit,
		handleFieldFocus,
		validateFieldOnBlur,
		isSubmitDisabled,
		displayedError,
		getFieldErrorWrapper,
	} = useFormController<LoginFormData>({
		schema: createLoginSchema(),
		defaultValues: {
			email: '',
			password: '',
		},
		fieldNames: ['email', 'password'],
		authErrorMsg,
		onSubmit: async (data) => {
			setIsLoggingIn(true);
			login(data.email, data.password)
				.then((authUser) => {
					if (!authUser) {
						setIsLoggingIn(false);
					}
				})
				.catch((error) => {
					console.error('Error during login:', error.message);
					setIsLoggingIn(false);
					showErrorToast(t('auth.error.login'), error.message);
				});
		},
	});

	useEffect(() => {
		if (paramsMessage) {
			if (paramsMessage.includes('email sent')) {
				showSuccessToast(
					t('auth.forgotPassword.success'),
					t('auth.forgotPassword.successDescription')
				);
			} else if (paramsMessage.includes('reset successful')) {
				showSuccessToast(
					t('auth.resetPassword.success'),
					t('auth.resetPassword.loginWithNewPassword')
				);
			} else {
				showErrorToast(
					t('auth.error.resetLinkError'),
					t('auth.error.resetLinkErrorDescription')
				);
			}
		}
		setParamsMessage('');

		return () => {
			setParamsMessage('');
		};
	}, [paramsMessage]);

	useEffect(() => {
		if (paramsError) {
			if (paramsError === 'reset_link_expired') {
				showErrorToast(
					t('auth.error.resetLinkExpired'),
					t('auth.error.resetLinkExpiredDescription')
				);
			} else if (paramsError === 'reset_link_invalid') {
				showErrorToast(
					t('auth.error.resetLinkInvalid'),
					t('auth.error.resetLinkInvalidDescription')
				);
			} else {
				showErrorToast(
					t('auth.error.resetLinkError'),
					t('auth.error.resetLinkErrorDescription')
				);
			}

			setParamsError('');
		}

		return () => {
			setParamsError('');
		};
	}, [paramsError]);

	useEffect(() => {
		if (isLoggingIn && user && !isLoading) {
			setIsLoggingIn(false);
			const userName = user.first_name || user.username || '';

			const redirectSource = params.redirectSource as string;
			if (redirectSource === 'share-collection') {
				router.replace('/(app)/(tabs)');
			} else {
				router.replace('/(app)/(tabs)');
			}

			showSuccessToast(
				t('auth.login.welcomeBack', {
					name: userName,
				}),
				t('auth.login.gladToSeeYou')
			);
		}
	}, [
		isLoggingIn,
		user,
		isLoading,
		showSuccessToast,
		t,
		params.redirectSource,
	]);

	return (
		<>
			<KeyboardAwareScrollView
				ref={scrollViewRef}
				className="flex-1 bg-background"
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					flexGrow: 1,
					padding: 8,
				}}
				bottomOffset={15}
			>
				<View className="flex-1 items-center p-4 gap-12 mt-20">
					<AuthHeader
						page={{
							title: t('auth.titles.login'),
							routerBack: '/(auth)/welcome' as RelativePathString,
						}}
					/>
					<View className="flex-1 justify-center items-center gap-8 w-full px-12">
						<ErrorMsg
							content={displayedError}
							display={displayedError !== ''}
						/>

						<FormTextInput
							name="email"
							control={control}
							label={t('auth.form.email.label')}
							placeholder={t('auth.form.email.placeholder')}
							ref={emailInputRef}
							nextInputRef={passwordInputRef}
							keyboardType="email-address"
							autoComplete="email"
							onFocus={() => handleFieldFocus('email')}
							onBlur={async (value) => {
								await validateFieldOnBlur('email', value);
							}}
							error={getFieldErrorWrapper('email')}
							getFieldError={getFieldErrorWrapper}
						/>

						<FormPasswordInput
							name="password"
							control={control}
							label={t('auth.form.password.label')}
							placeholder={t('auth.form.password.placeholder')}
							ref={passwordInputRef}
							onFocus={() => handleFieldFocus('password')}
							onBlur={async (value) => {
								await validateFieldOnBlur('password', value);
							}}
							onSubmitEditing={handleFormSubmit}
							error={getFieldErrorWrapper('password')}
							getFieldError={getFieldErrorWrapper}
						/>

						<View className="flex gap-5 w-full justify-center items-center">
							<MainButton
								content={t('auth.buttons.login')}
								backgroundColor={
									isSubmitDisabled
										? 'bg-primary/50'
										: 'bg-primary'
								}
								onPressAction={() => {
									if (!isSubmitDisabled) {
										handleFormSubmit();
									}
								}}
								isDisabled={isSubmitDisabled}
							/>

							<View className="flex gap-3 justify-center items-center w-full">
								<Pressable
									onPress={() =>
										setIsSignupModalVisible(true)
									}
								>
									<Text className="text-gray-600 text-center">
										{t('auth.links.dontHaveAccount')}{' '}
										<Text className="text-primary font-semibold">
											{t('auth.buttons.signUp')}
										</Text>
									</Text>
								</Pressable>
								<PageLink
									href="/forgot-password"
									linkText={t('auth.links.forgotPassword')}
								/>
							</View>
						</View>
					</View>
				</View>
			</KeyboardAwareScrollView>

			<AuthMethodModal
				visible={isSignupModalVisible}
				onClose={() => setIsSignupModalVisible(false)}
				mode="signup"
			/>
		</>
	);
}

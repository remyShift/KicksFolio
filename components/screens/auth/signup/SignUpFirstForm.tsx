import { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { RelativePathString } from 'expo-router';

import MainButton from '@/components/ui/buttons/MainButton';
import FormPasswordInput from '@/components/ui/inputs/FormPasswordInput';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useSignUpProps } from '@/context/signUpPropsContext';
import { useFormController } from '@/hooks/form/useFormController';
import { useAuth } from '@/hooks/useAuth';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import {
	createSignUpStep1Schema,
	SignUpStep1FormData,
} from '@/validation/auth';

import AuthHeader from '../AuthHeader';

export default function SignUpFirstForm() {
	const { t } = useTranslation();
	const scrollViewRef = useRef<ScrollView>(null);
	const usernameInputRef = useRef<TextInput>(null);
	const emailInputRef = useRef<TextInput>(null);
	const passwordInputRef = useRef<TextInput>(null);
	const confirmPasswordInputRef = useRef<TextInput>(null);

	const { signUpProps, setSignUpProps } = useSignUpProps();
	const { handleNextSignupPage } = useAuth();
	const { checkUsernameExists, checkEmailExists } = useAuthValidation();

	const {
		control,
		handleFormSubmit,
		handleFieldFocus,
		validateFieldOnBlur,
		isSubmitDisabled,
		displayedError,
		getFieldErrorWrapper,
	} = useFormController<SignUpStep1FormData>({
		schema: createSignUpStep1Schema(),
		defaultValues: {
			username: signUpProps.username || '',
			email: signUpProps.email || '',
			password: signUpProps.password || '',
			confirmPassword: signUpProps.confirmPassword || '',
		},
		fieldNames: ['username', 'email', 'password', 'confirmPassword'],
		enableClearError: false,
		asyncValidation: {
			username: checkUsernameExists,
			email: checkEmailExists,
		},
		onSubmit: async (data) => {
			setSignUpProps({
				...signUpProps,
				username: data.username,
				email: data.email,
				password: data.password,
				confirmPassword: data.confirmPassword,
			});

			await handleNextSignupPage({
				...signUpProps,
				username: data.username,
				email: data.email,
				password: data.password,
				confirmPassword: data.confirmPassword,
			});
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
				<AuthHeader
					page={{
						title: t('auth.titles.signup'),
						routerBack:
							'/(auth)/(signup)/sign-up' as RelativePathString,
					}}
				/>

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
						nextInputRef={emailInputRef}
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
						description={t('auth.form.password.description')}
						placeholder={t('auth.form.password.placeholder')}
						ref={passwordInputRef}
						nextInputRef={confirmPasswordInputRef}
						onFocus={() => handleFieldFocus('password')}
						onBlur={async (value) => {
							await validateFieldOnBlur('password', value);
						}}
						error={getFieldErrorWrapper('password')}
						getFieldError={getFieldErrorWrapper}
					/>

					<FormPasswordInput
						name="confirmPassword"
						control={control}
						label={t('auth.form.confirmPassword.label')}
						placeholder={t('auth.form.password.placeholder')}
						ref={confirmPasswordInputRef}
						onFocus={() => handleFieldFocus('confirmPassword')}
						onBlur={async (value) => {
							await validateFieldOnBlur('confirmPassword', value);
						}}
						onSubmitEditing={handleFormSubmit}
						error={getFieldErrorWrapper('confirmPassword')}
						getFieldError={getFieldErrorWrapper}
					/>

					<View className="flex gap-3 w-full justify-center items-center">
						<MainButton
							content={t('auth.buttons.nextStep')}
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
					</View>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}

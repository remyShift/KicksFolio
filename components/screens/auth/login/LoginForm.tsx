import { ScrollView, TextInput } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { View } from 'react-native'
import { useEffect, useRef, useState } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import FormTextInput from "@/components/ui/inputs/FormTextInput";
import FormPasswordInput from "@/components/ui/inputs/FormPasswordInput";
import { useFormController } from "@/hooks/useFormController";
import { createLoginSchema, LoginFormData } from "@/validation/schemas";
import PageLink from "@/components/ui/links/LoginPageLink"; 
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import useToast from "@/hooks/useToast";
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/authContext';
export default function LoginForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const { t } = useTranslation();

    const { login, errorMsg: authErrorMsg } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    const { user, isLoading } = useSession();
    const params = useLocalSearchParams();
    const [paramsMessage, setParamsMessage] = useState(params.message as string);
    const [paramsError, setParamsError] = useState(params.error as string);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

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
                    showErrorToast(
                        t('auth.error.login'), 
                        error.message
                    );
                });
        },
    });

    useEffect(() => {
        if (paramsMessage) {
            if (paramsMessage.includes('email sent')) {
                showSuccessToast(t('auth.forgotPassword.success'), t('auth.forgotPassword.successDescription'));
            } else if (paramsMessage.includes('reset successful')) {
                showSuccessToast(t('auth.resetPassword.success'), t('auth.resetPassword.loginWithNewPassword'));
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
            router.replace('/(app)/(tabs)');
            showSuccessToast(
                t('auth.login.welcomeBack', { name: userName }), 
                t('auth.login.gladToSeeYou')
            );
        }
    }, [isLoggingIn, user, isLoading, showSuccessToast, t]);

    return (
        <KeyboardAwareScrollView 
            ref={scrollViewRef}
            className="flex-1 bg-background" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 8 }}
            bottomOffset={10}
        >
            <View className="flex-1 justify-center items-center gap-12">
                <PageTitle content={t('auth.titles.login')} />
                <View className='flex justify-center items-center gap-8 w-full px-12'>
                    <ErrorMsg content={displayedError} display={displayedError !== ''} />

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
                        onBlur={async (value) => { await validateFieldOnBlur('email', value); }}
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
                        onBlur={async (value) => { await validateFieldOnBlur('password', value); }}
                        onSubmitEditing={handleFormSubmit}
                        error={getFieldErrorWrapper('password')}
                        getFieldError={getFieldErrorWrapper}
                    />
                </View>

                <View className='flex gap-5 w-full justify-center items-center'>                      
                    <MainButton 
                        content={t('auth.buttons.login')} 
                        backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                        onPressAction={() => {
                            if (!isSubmitDisabled) {
                                handleFormSubmit();
                            }
                        }}
                        isDisabled={isSubmitDisabled}
                    />
                    <View className='flex gap-3 justify-center items-center w-full'>
                        <PageLink 
                            href='/sign-up' 
                            textBeforeLink={t('auth.links.alreadyHaveAccount')} 
                            linkText={t('auth.buttons.signUp')} 
                        />
                        <PageLink 
                            href='/forgot-password' 
                            linkText={t('auth.links.forgotPassword')} 
                        />
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    )
}

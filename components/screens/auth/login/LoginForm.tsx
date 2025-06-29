import { ScrollView, TextInput, Alert } from "react-native";
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
import { loginSchema, LoginFormData } from "@/validation/schemas";
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
    const { user } = useSession();

    const { login, errorMsg: authErrorMsg } = useAuth();
    const { showSuccessToast } = useToast();
    const params = useLocalSearchParams();
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(params.message as string);

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        isSubmitDisabled,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<LoginFormData>({
        schema: loginSchema,
        defaultValues: {
            email: '',
            password: '',
        },
        fieldNames: ['email', 'password'],
        authErrorMsg,
        onSubmit: async (data) => {
            login(data.email, data.password)
                .then((user) => {
                    if (user) {
                        const userName = user.user_metadata?.first_name || user.user_metadata?.username || '';
                        showSuccessToast(
                            t('auth.login.welcomeBack', { name: userName }), 
                            t('auth.login.gladToSeeYou')
                        );
                        
                        setTimeout(() => {
                            router.replace('/(app)/(tabs)');
                        }, 500);
                    }
                })
                .catch((error) => {
                    console.log('Erreur lors de la connexion:', error);
                });
        },
    });

    useEffect(() => {
        if (resetPasswordSuccess) {
            Alert.alert(resetPasswordSuccess);
            setResetPasswordSuccess('');
        }

        return () => {
            setResetPasswordSuccess('');
        };
    }, [resetPasswordSuccess]);

    return (
        <KeyboardAwareScrollView 
            ref={scrollViewRef}
            className="flex-1 bg-background" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 8 }}
            bottomOffset={10}
        >
            <View className="flex-1 items-center gap-12 p-4">
                <PageTitle content={t('auth.login.title')} />
                <View className='flex justify-center items-center gap-8 w-full mt-36 px-12'>
                    <View className='w-full absolute' style={{ top: -50 }}>   
                        <ErrorMsg content={displayedError} display={displayedError !== ''} />
                    </View>

                    <FormTextInput
                        name="email"
                        control={control}
                        label={t('auth.login.email')}
                        placeholder={t('auth.login.emailPlaceholder')}
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
                        label={t('auth.login.password')}
                        placeholder={t('auth.login.passwordPlaceholder')}
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
                        content={t('auth.login.loginButton')} 
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
                            textBeforeLink={t('auth.login.noAccount')} 
                            linkText={t('auth.login.signUp')} 
                        />
                        <PageLink 
                            href='/forgot-password' 
                            linkText={t('auth.login.forgotPassword')} 
                        />
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    )
}

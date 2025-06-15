import { ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { View, Text } from 'react-native'
import { useEffect, useRef, useState } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import { Link, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import FormTextInput from "@/components/ui/inputs/FormTextInput";
import FormPasswordInput from "@/components/ui/inputs/FormPasswordInput";
import { useFormController } from "@/hooks/useFormController";
import { loginSchema, LoginFormData } from "@/validation/schemas";
import PageLink from "@/components/ui/links/LoginPageLink";

export default function LoginForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const { login, errorMsg: authErrorMsg } = useAuth();

    const params = useLocalSearchParams();
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(params.message as string);

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
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
            await login(data.email, data.password);
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
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
            >
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Login' />
                    <View className='flex justify-center items-center gap-8 w-full mt-36 px-12'>
                        <View className='w-full absolute' style={{ top: -50 }}>   
                            <ErrorMsg content={displayedError} display={displayedError !== ''} />
                        </View>

                        <FormTextInput
                            name="email"
                            control={control}
                            label="*Email"
                            placeholder="john@doe.com"
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
                            label="*Password"
                            placeholder="********"
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
                            content='Login' 
                            backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                            onPressAction={() => {
                                if (!isSubmitDisabled) {
                                    handleFormSubmit();
                                }
                            }}
                            isDisabled={isSubmitDisabled}
                        />
                        <View className='flex gap-3 justify-center items-center w-full'>
                            <PageLink href='/sign-up' textBeforeLink="Don't have an account ?" linkText='Sign Up' />
                            <PageLink href='/forgot-password' linkText='Forgot Password?' />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

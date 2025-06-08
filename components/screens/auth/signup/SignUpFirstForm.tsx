import ErrorMsg from "@/components/ui/text/ErrorMsg";
import PageTitle from "@/components/ui/text/PageTitle";
import { ScrollView, View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useRef } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import LoginPageLink from "@/components/ui/links/LoginPageLink";
import UsernameInput from "@/components/ui/inputs/authForm/UsernameInput";
import EmailInput from "@/components/ui/inputs/authForm/EmailInput";
import PasswordInput from "@/components/ui/inputs/authForm/PasswordInput";
import ConfirmPasswordInput from "@/components/ui/inputs/authForm/ConfirmPasswordInput";
import { useSignUpProps } from "@/context/signUpPropsContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAuth } from "@/hooks/useAuth";
import { FormErrorsProvider } from "@/context/formErrorsContext";

export default function SignUpFirstForm() {
    const [usernameErrorMsg, setUsernameErrorMsg] = useState('');
    const [emailErrorMsg, setEmailErrorMsg] = useState('');
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
    const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState('');
    const [isUsernameError, setIsUsernameError] = useState(false);
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const usernameInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const { signUpProps, setSignUpProps } = useSignUpProps();
    const { handleNextSignupPage } = useAuth();
    
    const { validateForm, globalErrorMsg, clearErrors } = useFormValidation({
        errorSetters: {
            username: setIsUsernameError,
            email: setIsEmailError,
            password: setIsPasswordError,
            confirmPassword: setIsConfirmPasswordError,
        }
    });

    const mergedErrorMsg = usernameErrorMsg || emailErrorMsg || passwordErrorMsg || confirmPasswordErrorMsg || globalErrorMsg;

    const handleNext = async (): Promise<string | null> => {
        const result = await validateForm([
            { value: signUpProps.username, fieldType: 'username', isRequired: true },
            { value: signUpProps.email, fieldType: 'email', isRequired: true },
            { value: signUpProps.password, fieldType: 'password', isRequired: true },
            { value: signUpProps.confirmPassword, fieldType: 'confirmPassword', isRequired: true, customValidation: signUpProps.password },
        ]);

        if (result.isValid) {
            return handleNextSignupPage(signUpProps);
        }
        return result.errorMsg;
    };

    return (
        <KeyboardAvoidingView 
        className="flex-1 bg-background" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}>
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Sign Up' />
                    <View className='flex justify-center items-center gap-8 w-full mt-10'>
                        <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                            <ErrorMsg content={mergedErrorMsg} display={mergedErrorMsg !== ''} />
                        </View>
                        
                        <FormErrorsProvider clearErrors={clearErrors}>
                            <UsernameInput
                                inputRef={usernameInputRef}
                                signUpProps={signUpProps}
                                setSignUpProps={setSignUpProps}
                                scrollViewRef={scrollViewRef}
                                onErrorChange={setUsernameErrorMsg}
                                nextInputRef={emailInputRef}
                                isError={isUsernameError}
                            />

                            <EmailInput
                                inputRef={emailInputRef}
                                signUpProps={signUpProps}
                                setSignUpProps={setSignUpProps}
                                scrollViewRef={scrollViewRef}
                                onErrorChange={setEmailErrorMsg}
                                nextInputRef={passwordInputRef}
                                isError={isEmailError}
                            />

                            <PasswordInput
                                title='*Password'
                                inputRef={passwordInputRef}
                                signUpProps={signUpProps}
                                setSignUpProps={setSignUpProps}
                                scrollViewRef={scrollViewRef}
                                onErrorChange={setPasswordErrorMsg}
                                nextInputRef={confirmPasswordInputRef}
                                isError={isPasswordError}
                            />

                            <ConfirmPasswordInput
                                inputRef={confirmPasswordInputRef}
                                signUpProps={signUpProps}
                                setSignUpProps={setSignUpProps}
                                scrollViewRef={scrollViewRef}
                                onErrorChange={setConfirmPasswordErrorMsg}
                                onSubmitEditing={handleNext}
                                isError={isConfirmPasswordError}
                            />
                        </FormErrorsProvider>
                    </View>

                    <View className='flex gap-5 w-full justify-center items-center'>
                        <MainButton 
                            content='Next' 
                            backgroundColor='bg-primary' 
                            onPressAction={handleNext} 
                        />
                        <LoginPageLink />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

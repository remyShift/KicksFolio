import ErrorMsg from "@/components/ui/text/ErrorMsg";
import PageTitle from "@/components/ui/text/PageTitle";
import { ScrollView, View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useRef } from "react";
import { useForm } from "@/hooks/useForm";
import MainButton from "@/components/ui/buttons/MainButton";
import LoginPageLink from "@/components/ui/links/LoginPageLink";
import { router } from "expo-router";
import UsernameInput from "@/components/ui/inputs/UsernameInput";
import EmailInput from "@/components/ui/inputs/EmailInput";
import PasswordInput from "@/components/ui/inputs/PasswordInput";
import ConfirmPasswordInput from "@/components/ui/inputs/ConfirmPasswordInput";

export default function SignUpFirstForm() {
    const [isUsernameError, setIsUsernameError] = useState(false);
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const usernameInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const [signUpProps, setSignUpProps] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const { formValidation, errorMsg } = useForm({
        errorSetters: {
            username: (isError: boolean) => setIsUsernameError(isError),
            email: (isError: boolean) => setIsEmailError(isError),
            password: (isError: boolean) => setIsPasswordError(isError),
            confirmPassword: (isError: boolean) => setIsConfirmPasswordError(isError)
        },
        scrollViewRef
    });

    // TODO: extract this to useAuth hook
    const handleNextSignupPage = async () => {
        const isUsernameValid = await formValidation.validateField(signUpProps.username, 'username');
        const isEmailValid = await formValidation.validateField(signUpProps.email, 'email');
        const isPasswordValid = await formValidation.validateField(signUpProps.password, 'password');
        const isConfirmPasswordValid = await formValidation.validateField(signUpProps.confirmPassword, 'confirmPassword', false, null, signUpProps.password);

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            formValidation.setErrorMessage('Please correct your inputs before continuing');
            setIsUsernameError(true);
            setIsEmailError(true);
            setIsPasswordError(true);
            setIsConfirmPasswordError(true);
            return;
        }

        formValidation.setErrorMessage('');
        router.replace('/sign-up-second');
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
                            <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                        </View>
                        
                        <UsernameInput
                            inputRef={usernameInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            isUsernameError={isUsernameError}
                            isUsernameFocused={isUsernameFocused}
                            scrollViewRef={scrollViewRef}
                        />

                        <EmailInput
                            inputRef={emailInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            isEmailError={isEmailError}
                            isEmailFocused={isEmailFocused}
                            scrollViewRef={scrollViewRef}
                        />

                        <PasswordInput
                            title='*Password'
                            inputRef={passwordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            isPasswordError={isPasswordError}
                            isPasswordFocused={isPasswordFocused}
                            scrollViewRef={scrollViewRef}
                        />

                        <ConfirmPasswordInput
                            inputRef={confirmPasswordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            isConfirmPasswordError={isConfirmPasswordError}
                            isConfirmPasswordFocused={isConfirmPasswordFocused}
                            scrollViewRef={scrollViewRef}
                        />
                    </View>

                    <View className='flex gap-5 w-full justify-center items-center'>
                        <MainButton 
                            content='Next' 
                            backgroundColor='bg-primary' 
                            onPressAction={() => {
                                setTimeout(() => {
                                    handleNextSignupPage();
                                }, 500);
                            }} 
                        />
                        <LoginPageLink />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

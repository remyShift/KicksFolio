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
import { useSignUpValidation } from "@/hooks/useSignUpValidation";
import { useAuth } from "@/hooks/useAuth";

export default function SignUpFirstForm() {
    const [usernameErrorMsg, setUsernameErrorMsg] = useState('');
    const [emailErrorMsg, setEmailErrorMsg] = useState('');
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
    const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState('');

    const scrollViewRef = useRef<ScrollView>(null);
    const usernameInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const { signUpProps, setSignUpProps } = useSignUpProps();
    const { handleNextSignupPage } = useAuth();
    const { errorMsg: globalErrorMsg } = useSignUpValidation();

    const mergedErrorMsg = usernameErrorMsg || emailErrorMsg || passwordErrorMsg || confirmPasswordErrorMsg || globalErrorMsg;

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
                        
                        <UsernameInput
                            inputRef={usernameInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setUsernameErrorMsg}
                            nextInputRef={emailInputRef}
                        />

                        <EmailInput
                            inputRef={emailInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setEmailErrorMsg}
                            nextInputRef={passwordInputRef}
                        />

                        <PasswordInput
                            title='*Password'
                            inputRef={passwordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setPasswordErrorMsg}
                            nextInputRef={confirmPasswordInputRef}
                        />

                        <ConfirmPasswordInput
                            inputRef={confirmPasswordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setConfirmPasswordErrorMsg}
                            onSubmitEditing={() => handleNextSignupPage(signUpProps)}
                        />
                    </View>

                    <View className='flex gap-5 w-full justify-center items-center'>
                        <MainButton 
                            content='Next' 
                            backgroundColor='bg-primary' 
                            onPressAction={() => {
                                handleNextSignupPage(signUpProps);
                            }} 
                        />
                        <LoginPageLink />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

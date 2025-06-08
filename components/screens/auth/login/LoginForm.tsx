import { ScrollView, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { View, Text } from 'react-native'
import { useState, useRef } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import PasswordInput from "@/components/ui/inputs/authForm/PasswordInput";
import EmailInput from "@/components/ui/inputs/authForm/EmailInput";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormErrorsProvider } from "@/context/formErrorsContext";

export default function LoginForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErrorMsg, setEmailErrorMsg] = useState('');
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const { login, errorMsg: authErrorMsg } = useAuth();
    
    const { validateForm, globalErrorMsg, clearErrors } = useFormValidation({
        errorSetters: {
            email: setIsEmailError,
            password: setIsPasswordError,
        }
    });

    const errorMsg = emailErrorMsg || passwordErrorMsg || authErrorMsg || globalErrorMsg;

    const handleLogin = async () => {
        const result = await validateForm([
            { value: email, fieldType: 'email', isRequired: true },
            { value: password, fieldType: 'password', isRequired: true },
        ]);

        if (!result.isValid) {
            return;
        }

        setEmailErrorMsg('');
        setPasswordErrorMsg('');
        
        login(email, password)
            .catch((error) => {
                console.log(error);
                setEmailErrorMsg(error.message);
                setPasswordErrorMsg('');
            });
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
            >
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Login' />
                    <View className='flex justify-center items-center gap-8 w-full mt-36'>
                        <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                            <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                        </View>
                        <FormErrorsProvider clearErrors={clearErrors}>
                            <EmailInput
                                inputRef={emailInputRef}
                                scrollViewRef={scrollViewRef}
                                onErrorChange={setEmailErrorMsg}
                                onValueChange={setEmail}
                                isLoginPage={true}
                                nextInputRef={passwordInputRef}
                                isError={isEmailError}
                            />
                            
                            <PasswordInput
                                inputRef={passwordInputRef}
                                scrollViewRef={scrollViewRef}
                                onErrorChange={setPasswordErrorMsg}
                                onValueChange={setPassword}
                                title='*Password'
                                isLoginPage={true}
                                submitAction={handleLogin}
                                isError={isPasswordError}
                            />
                        </FormErrorsProvider>
                    </View>
                    <View className='flex gap-5 w-full justify-center items-center'>                      
                        <MainButton 
                            content='Login' 
                            backgroundColor='bg-primary' 
                            onPressAction={handleLogin}
                        />
                        <View className='flex gap-1 justify-center items-center'>
                            <View className='flex flex-row gap-1 justify-center items-center'>
                                <Text className='font-spacemono-bold text-sm'>Don't have an account?</Text>
                                <Link href='/sign-up'>
                                    <Text className='text-primary font-spacemono-bold text-sm'>
                                        Sign Up
                                    </Text>
                                </Link>
                            </View>
                            <Link href='/forgot-password'>
                                <Text className='text-primary font-spacemono-bold text-sm'>
                                    Forgot Password?
                                </Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

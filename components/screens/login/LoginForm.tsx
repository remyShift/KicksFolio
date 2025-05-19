import { TextInput } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { View, Text } from 'react-native'
import { useState, useRef } from "react";
import { authService } from "@/services/AuthService";
import MainButton from "@/components/ui/buttons/MainButton";
import { Link, router } from "expo-router";
import { FormValidationService } from "@/services/FormValidationService";
import { FormService } from "@/services/FormService";

interface LoginFormProps {
    isEmailFocused: boolean,
    isPasswordFocused: boolean,
    setIsEmailFocused: (isFocused: boolean) => void,
    setIsPasswordFocused: (isFocused: boolean) => void
}

export default function LoginForm({ 
    isEmailFocused, 
    isPasswordFocused, 
    setIsEmailFocused, 
    setIsPasswordFocused 
}: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const formValidation = new FormValidationService(setErrorMsg, {
        email: setIsEmailError,
        password: setIsPasswordError
    })

    const handleForm = new FormService(setErrorMsg, {
        email: setIsEmailFocused,
        password: setIsPasswordFocused
    })

    const handleLogin = async () => {
        const success = await authService.handleLogin(email, password, formValidation);

        if (success) {
            setIsEmailFocused(false);
            setIsPasswordFocused(false);
            router.replace('/');
        }
    }

    return (
        <View className="flex-1 items-center gap-12 p-4">
            <PageTitle content='Login' />
            <View className='flex justify-center items-center gap-8 w-full mt-36'>
                <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                    <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                </View>
                <View className='flex flex-col gap-2 w-full justify-center items-center'>
                    <Text className='font-spacemono-bold text-lg'>Email</Text>
                    <TextInput
                        placeholder="john@doe.com"
                        ref={emailInputRef}
                        inputMode='email'
                        autoComplete='email'
                        textContentType='emailAddress'
                        clearButtonMode='while-editing'
                        onFocus={() => handleForm.inputFocus('email')}
                        onBlur={() => handleForm.inputBlur('email', email)}
                        returnKeyType='next'
                        enablesReturnKeyAutomatically={true}
                        autoCorrect={false}
                        placeholderTextColor='gray'
                        onChangeText={(text) => handleForm.inputChange(text, setEmail)}
                        className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                            isEmailError ? 'border-2 border-red-500' : ''
                        } ${isEmailFocused ? 'border-2 border-primary' : ''}`}
                    />
                </View>

                <View className='flex flex-col gap-2 w-full justify-center items-center'>
                    <Text className='font-spacemono-bold text-lg'>Password</Text>
                    <TextInput 
                        placeholder="********" 
                        ref={passwordInputRef}
                        inputMode='text'
                        textContentType='password'
                        autoComplete='current-password'
                        clearButtonMode='while-editing'
                        autoCorrect={false}
                        secureTextEntry={true}
                        onFocus={() => handleForm.inputFocus('password')}
                        onBlur={() => handleForm.inputBlur('password', password)}
                        returnKeyType='done'
                        enablesReturnKeyAutomatically={true}
                        onSubmitEditing={() => handleLogin()}
                        placeholderTextColor='gray'
                        onChangeText={(text) => handleForm.inputChange(text, setPassword)}
                        className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                            isPasswordError ? 'border-2 border-red-500' : ''
                        } ${isPasswordFocused ? 'border-2 border-primary' : ''}`}
                    />
                </View>
            </View>
            <View className='flex gap-5 w-full justify-center items-center'>                      
                <MainButton content='Login' backgroundColor='bg-primary' onPressAction={async () => {
                    await handleLogin();
                }} />
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
    )
}

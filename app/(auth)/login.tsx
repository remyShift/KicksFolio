import { Link, router } from 'expo-router';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import PageTitle from '@/components/ui/text/PageTitle';
import MainButton from '@/components/ui/buttons/MainButton';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { FormService } from '@/services/FormService';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';
import { AuthService } from '@/services/AuthService';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);

    const formValidation = new FormService(setErrorMsg, {
        email: setIsEmailError,
        password: setIsPasswordError
    }, {
        email: setIsEmailFocused,
        password: setIsPasswordFocused
    }, scrollViewRef);

    const authService = new AuthService();

    const handleLogin = async () => {
        const success = await authService.handleLogin(email, password, formValidation);
        if (success) {
            router.replace('/(app)/(tabs)');
        }
    };

    return (
        <>
            <KeyboardAvoidingView 
                className="flex-1 bg-background" 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={isEmailFocused || isPasswordFocused}>
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
                                    onFocus={() => formValidation.handleInputFocus('email')}
                                    onBlur={() => formValidation.handleInputBlur('email', email)}
                                    returnKeyType='next'
                                    enablesReturnKeyAutomatically={true}
                                    autoCorrect={false}
                                    placeholderTextColor='gray'
                                    onChangeText={(text) => formValidation.handleInputChange(text, setEmail)}
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
                                    onFocus={() => formValidation.handleInputFocus('password')}
                                    onBlur={() => formValidation.handleInputBlur('password', password)}
                                    returnKeyType='done'
                                    enablesReturnKeyAutomatically={true}
                                    onSubmitEditing={() => handleLogin()}
                                    placeholderTextColor='gray'
                                    onChangeText={(text) => formValidation.handleInputChange(text, setPassword)}
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
                </ScrollView>
            </KeyboardAvoidingView>
            <View className='flex justify-center items-center bg-background pb-10'>
                <PrivacyPolicy />
            </View>
        </>
    );
}

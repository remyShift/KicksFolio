import { Link, router } from 'expo-router';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, ScrollView } from 'react-native';
import { useSignUpProps } from '@/context/signUpPropsContext';
import PageTitle from '@/components/ui/text/PageTitle';
import MainButton from '@/components/ui/buttons/MainButton';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useState, useRef } from 'react';
import { FormValidationService } from '@/services/FormValidationService';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';

export default function SignUp() {
    const { signUpProps, setSignUpProps } = useSignUpProps();
    const [errorMsg, setErrorMsg] = useState('');
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isUsernameError, setIsUsernameError] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const usernameInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const formValidation = new FormValidationService(setErrorMsg, {
        username: setIsUsernameError,
        email: setIsEmailError,
        password: setIsPasswordError,
        confirmPassword: setIsConfirmPasswordError
    });

    const scrollToBottom = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const handleInputFocus = (inputType: 'username' | 'email' | 'password' | 'confirmPassword') => {
        if (inputType === 'username') {
            setIsUsernameFocused(true);
        } else if (inputType === 'email') {
            setIsEmailFocused(true);
        } else if (inputType === 'password') {
            setIsPasswordFocused(true);
        } else if (inputType === 'confirmPassword') {
            setIsConfirmPasswordFocused(true);
        }
        setIsUsernameError(false);
        setIsEmailError(false);
        setIsPasswordError(false);
        setIsConfirmPasswordError(false);
        setErrorMsg('');

        if (inputType === 'password' || inputType === 'confirmPassword') {
            scrollToBottom();
        }
    };

    const handleInputBlur = (inputType: 'username' | 'email' | 'password' | 'confirmPassword', value: string) => {
        if (inputType === 'username') {
            setIsUsernameFocused(false);
            formValidation.validateField(value, 'username', 'username');
        } else if (inputType === 'email') {
            setIsEmailFocused(false);
            formValidation.validateField(value, 'email', 'email');
        } else if (inputType === 'password') {
            setIsPasswordFocused(false);
            formValidation.validateField(value, 'password', 'password');
        } else if (inputType === 'confirmPassword') {
            setIsConfirmPasswordFocused(false);
            formValidation.validateField(value, 'confirmPassword', 'confirmPassword');
        }
    };

    const handleNextSignUpPage = async () => {
        const isUsernameValid = await formValidation.validateField(signUpProps.username, 'username', 'username');
        const isEmailValid = await formValidation.validateField(signUpProps.email, 'email', 'email');
        const isPasswordValid = await formValidation.validateField(signUpProps.password, 'password', 'password');
        const isConfirmPasswordValid = await formValidation.validateField(signUpProps.confirmPassword, 'confirmPassword', 'confirmPassword');

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            setErrorMsg('Please correct your inputs before continuing');
            setIsUsernameError(true);
            setIsEmailError(true);
            setIsPasswordError(true);
            setIsConfirmPasswordError(true);
            return;
        }

        setErrorMsg('');
        router.replace('/sign-up-second');
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
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={false}>
                    <View className="flex-1 items-center gap-12 p-4">
                        <PageTitle content='Sign Up' />
                        <View className='flex justify-center items-center gap-8 w-full mt-10'>
                            <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                                <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                            </View>
                            
                            <View className='flex flex-col gap-2 w-full justify-center items-center'>
                                <Text className='font-spacemono-bold text-lg'>*Username</Text>
                                <TextInput
                                    placeholder="johndoe42"
                                    inputMode='text'
                                    ref={usernameInputRef}
                                    value={signUpProps.username}
                                    autoComplete='username'
                                    textContentType='username'
                                    clearButtonMode='while-editing'
                                    autoCorrect={false}
                                    placeholderTextColor='gray'
                                    returnKeyType='next'
                                    enablesReturnKeyAutomatically={true}
                                    onSubmitEditing={() => formValidation.validateField(signUpProps.username, 'username', 'username')}
                                    onFocus={() => handleInputFocus('username')}
                                    onBlur={() => handleInputBlur('username', signUpProps.username)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, username: text });
                                        formValidation.handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, username: t }));
                                    }}
                                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                        isUsernameError ? 'border-2 border-red-500' : ''
                                    } ${isUsernameFocused ? 'border-2 border-primary' : ''}`}
                                />
                            </View>

                            <View className='flex flex-col gap-2 w-full justify-center items-center'>
                                <Text className='font-spacemono-bold text-lg'>*Email</Text>
                                <TextInput
                                    ref={emailInputRef}
                                    placeholder="johndoe@gmail.com"
                                    inputMode='email'
                                    value={signUpProps.email}
                                    autoComplete='email'
                                    textContentType='emailAddress'
                                    autoCorrect={false}
                                    placeholderTextColor='gray'
                                    clearButtonMode='while-editing'
                                    returnKeyType='next'
                                    enablesReturnKeyAutomatically={true}
                                    onSubmitEditing={() => formValidation.validateField(signUpProps.email, 'email', 'email')}
                                    onFocus={() => handleInputFocus('email')}
                                    onBlur={() => handleInputBlur('email', signUpProps.email)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, email: text });
                                        formValidation.handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, email: t }));
                                    }}
                                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                        isEmailError ? 'border-2 border-red-500' : ''
                                    } ${isEmailFocused ? 'border-2 border-primary' : ''}`}
                                />
                            </View>

                            <View className='flex flex-col gap-2 w-full justify-center items-center'>
                                <Text className='font-spacemono-bold text-lg'>*Password</Text>
                                <Text className='font-spacemono-bold text-sm text-center px-6 text-gray-600'>
                                    At least one uppercase letter and one number and be 8 characters long.
                                </Text>
                                <TextInput
                                    ref={passwordInputRef}
                                    value={signUpProps.password}
                                    placeholder="********"
                                    inputMode='text'
                                    textContentType='newPassword'
                                    passwordRules='{ "minLength": 8, "requiresUppercase": true, "requiresLowercase": true, "requiresNumeric": true }'
                                    clearButtonMode='while-editing'
                                    autoCorrect={false}
                                    secureTextEntry={true}
                                    placeholderTextColor='gray'
                                    returnKeyType='next'
                                    enablesReturnKeyAutomatically={true}
                                    onSubmitEditing={() => formValidation.validateField(signUpProps.password, 'password', 'password')}
                                    onFocus={() => handleInputFocus('password')}
                                    onBlur={() => handleInputBlur('password', signUpProps.password)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, password: text });
                                        formValidation.handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, password: t }));
                                    }}
                                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                        isPasswordError ? 'border-2 border-red-500' : ''
                                    } ${isPasswordFocused ? 'border-2 border-primary' : ''}`}
                                />
                            </View>

                            <View className='flex flex-col gap-2 w-full justify-center items-center'>
                                <Text className='font-spacemono-bold text-lg'>*Confirm Password</Text>
                                <TextInput
                                    ref={confirmPasswordInputRef}
                                    value={signUpProps.confirmPassword}
                                    placeholder="********"
                                    inputMode='text'
                                    textContentType='newPassword'
                                    clearButtonMode='while-editing'
                                    autoCorrect={false}
                                    secureTextEntry={true}
                                    placeholderTextColor='gray'
                                    returnKeyType='done'
                                    enablesReturnKeyAutomatically={true}
                                    onSubmitEditing={handleNextSignUpPage}
                                    onFocus={() => handleInputFocus('confirmPassword')}
                                    onBlur={() => handleInputBlur('confirmPassword', signUpProps.confirmPassword)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, confirmPassword: text });
                                        formValidation.handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, confirmPassword: t }));
                                    }}
                                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                        isConfirmPasswordError ? 'border-2 border-red-500' : ''
                                    } ${isConfirmPasswordFocused ? 'border-2 border-primary' : ''}`}
                                />
                            </View>
                        </View>

                        <View className='flex gap-5 w-full justify-center items-center'>
                            <MainButton 
                                content='Next' 
                                backgroundColor='bg-primary' 
                                onPressAction={() => {
                                    setTimeout(() => {
                                        handleNextSignUpPage();
                                    }, 500);
                                }} 
                            />
                            <View className='flex gap-0 w-full justify-center items-center'>
                                <Text className='font-spacemono-bold text-sm'>Already have an account ?</Text>
                                <Link href='/login'>
                                    <Text className='text-primary font-spacemono-bold text-sm'>
                                        Login
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

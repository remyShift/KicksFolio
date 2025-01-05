import { Link, router } from 'expo-router';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, ScrollView } from 'react-native';
import { useSignUpProps } from '@/context/signUpPropsContext';
import PageTitle from '@/components/text/PageTitle';
import MainButton from '@/components/buttons/MainButton';
import ErrorMsg from '@/components/text/ErrorMsg';
import { useState, useRef } from 'react';
import { handleInputChange, checkUsername, checkEmail, checkPassword, checkBeforeNext, checkConfirmPassword } from '@/scripts/formUtils';
import PrivacyPolicy from '@/components/text/PrivacyPolicy';

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
            checkUsername(value, setErrorMsg, setIsUsernameError);
        } else if (inputType === 'email') {
            setIsEmailFocused(false);
            checkEmail(value, false, setErrorMsg, setIsEmailError);
        } else if (inputType === 'password') {
            setIsPasswordFocused(false);
            checkPassword(value, setErrorMsg, setIsPasswordError);
        } else if (inputType === 'confirmPassword') {
            setIsConfirmPasswordFocused(false);
            checkConfirmPassword(value, signUpProps.password, setErrorMsg, setIsConfirmPasswordError);
        }
    };

    const handleNextSignUpPage = async () => {
        const isUsernameValid = await checkUsername(signUpProps.username, setErrorMsg, setIsUsernameError);
        const isEmailValid = await checkEmail(signUpProps.email, false, setErrorMsg, setIsEmailError);
        const isPasswordValid = checkPassword(signUpProps.password, setErrorMsg, setIsPasswordError);
        const isConfirmPasswordValid = checkConfirmPassword(signUpProps.confirmPassword, signUpProps.password, setErrorMsg, setIsConfirmPasswordError);

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            setErrorMsg('Please correct your inputs before continuing');
            setIsUsernameError(true);
            setIsEmailError(true);
            setIsPasswordError(true);
            setIsConfirmPasswordError(true);
            return;
        }

        setErrorMsg('');
        router.replace('/su-second');
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
                                    onSubmitEditing={() => checkBeforeNext(signUpProps.username, 'username', false, setErrorMsg, setIsUsernameError, emailInputRef)}
                                    onFocus={() => handleInputFocus('username')}
                                    onBlur={() => handleInputBlur('username', signUpProps.username)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, username: text });
                                        handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, username: t }), setErrorMsg);
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
                                    onSubmitEditing={() => checkBeforeNext(signUpProps.email, 'email', false, setErrorMsg, setIsEmailError, passwordInputRef)}
                                    onFocus={() => handleInputFocus('email')}
                                    onBlur={() => handleInputBlur('email', signUpProps.email)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, email: text });
                                        handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, email: t }), setErrorMsg);
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
                                    onSubmitEditing={() => checkBeforeNext(signUpProps.password, 'password', false, setErrorMsg, setIsPasswordError, confirmPasswordInputRef)}
                                    onFocus={() => handleInputFocus('password')}
                                    onBlur={() => handleInputBlur('password', signUpProps.password)}
                                    onChangeText={(text) => {
                                        setSignUpProps({ ...signUpProps, password: text });
                                        handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, password: t }), setErrorMsg);
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
                                        handleInputChange(text, (t) => setSignUpProps({ ...signUpProps, confirmPassword: t }), setErrorMsg);
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
                                    }, 300);
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

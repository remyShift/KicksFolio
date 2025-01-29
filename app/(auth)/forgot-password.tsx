import { Link, router } from 'expo-router';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, ScrollView } from 'react-native';
import PageTitle from '@/components/text/PageTitle';
import MainButton from '@/components/buttons/MainButton';
import ErrorMsg from '@/components/text/ErrorMsg';
import { handleInputChange } from '@/scripts/formUtils';
import PrivacyPolicy from '@/components/text/PrivacyPolicy';
import { useRef } from 'react';
import { useState } from 'react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isEmailError, setIsEmailError] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToBottom = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const handleInputFocus = () => {
        setErrorMsg('');
        setIsEmailFocused(true);
        scrollToBottom();
    };

    const handleInputBlur = (inputType: 'email', value: string) => {
        const isEmail = inputType === 'email';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorMessage = isEmail ? 'Please put your email.' : 'Please put your password.';

        setIsEmailFocused(false);
        if (!value) {
            setErrorMsg(errorMessage);
            setIsEmailError(true);
        } else if (isEmail && !emailRegex.test(value)) {
            setErrorMsg('Please put a valid email.');
            setIsEmailError(true);
        } else if (isEmail && emailRegex.test(value)) {
            setErrorMsg('');
            setIsEmailError(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setErrorMsg('Please enter your email.');
            setIsEmailError(true);
            return;
        }

        await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/passwords/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.error) {
                setErrorMsg(data.error);
            } else {
                router.replace('/login');
            }
        });
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
                    scrollEnabled={isEmailFocused}>
                    <View className="flex-1 items-center gap-12 p-4">
                        <PageTitle content='Login' />
                        <View className='flex justify-cente r items-center gap-8 w-full mt-48'>
                            <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                                <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                            </View>
                            <View className='flex flex-col gap-2 w-full justify-center items-center'>
                                <Text className='font-spacemono-bold text-lg'>Email</Text>
                                <TextInput
                                    placeholder="john@doe.com"
                                    inputMode='email'
                                    autoComplete='email'
                                    textContentType='emailAddress'
                                    clearButtonMode='while-editing'
                                    onFocus={() => handleInputFocus()}
                                    onBlur={() => handleInputBlur('email', email)}
                                    returnKeyType='next'
                                    enablesReturnKeyAutomatically={true}
                                    autoCorrect={false}
                                    placeholderTextColor='gray'
                                    onChangeText={(text) => handleInputChange(text, setEmail, setErrorMsg)}
                                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                        isEmailError ? 'border-2 border-red-500' : ''
                                    } ${isEmailFocused ? 'border-2 border-primary' : ''}`}
                                />
                            </View>

                            <View className='flex gap-6 w-full justify-center items-center'>                      
                                <MainButton content='Send' backgroundColor='bg-primary' onPressAction={async () => {
                                    await handlePasswordReset();
                                }} />
                                <View className='flex gap-1 justify-center items-center'>
                                    <Link href='/login'>
                                        <Text className='text-primary font-spacemono-bold text-sm'>
                                            Back to Login
                                        </Text>
                                    </Link>
                                </View>
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

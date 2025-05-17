import { Link, router } from 'expo-router';
import { View, TextInput, KeyboardAvoidingView, Text, Platform, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import PageTitle from '@/components/ui/text/PageTitle';
import MainButton from '@/components/ui/buttons/MainButton';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { FormService } from '@/services/FormService';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';
import { AuthService } from '@/services/AuthService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isEmailError, setIsEmailError] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);

    const formValidation = new FormService(setErrorMsg, {
        email: setIsEmailError
    }, {
        email: setIsEmailFocused
    }, scrollViewRef);

    const authService = new AuthService();

    const handlePasswordReset = async () => {
        const success = await authService.handleForgotPassword(email, formValidation);
        if (success) {
            router.replace('/login');
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
                    scrollEnabled={isEmailFocused}>
                    <View className="flex-1 items-center gap-12 p-4">
                        <PageTitle content='Forgot Password' />
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
                                    returnKeyType='done'
                                    enablesReturnKeyAutomatically={true}
                                    autoCorrect={false}
                                    placeholderTextColor='gray'
                                    onChangeText={(text) => formValidation.handleInputChange(text, setEmail)}
                                    className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                        isEmailError ? 'border-2 border-red-500' : ''
                                    } ${isEmailFocused ? 'border-2 border-primary' : ''}`}
                                />
                            </View>
                        </View>
                        <View className='flex gap-5 w-full justify-center items-center'>                      
                            <MainButton content='Send Reset Link' backgroundColor='bg-primary' onPressAction={handlePasswordReset} />
                            <View className='flex gap-1 justify-center items-center'>
                                <View className='flex flex-row gap-1 justify-center items-center'>
                                    <Text className='font-spacemono-bold text-sm'>Remember your password?</Text>
                                    <Link href='/login'>
                                        <Text className='text-primary font-spacemono-bold text-sm'>
                                            Login
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

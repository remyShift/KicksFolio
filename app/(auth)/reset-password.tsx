import { View, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef } from 'react';
import PageTitle from '@/components/ui/text/PageTitle';
import MainButton from '@/components/ui/buttons/MainButton';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { FormValidationService } from '@/services/FormValidationService';

export default function ResetPassword() {
    const { token } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const formValidation = new FormValidationService(setErrorMsg, {
        password: setIsPasswordError,
        confirmPassword: setIsConfirmPasswordError
    }, {
        password: setIsPasswordFocused,
        confirmPassword: setIsConfirmPasswordFocused
    }, scrollViewRef);

    const handleResetPassword = () => {
        if (!formValidation.validateField(newPassword, 'password', 'password')) {
            return;
        }

        if (!formValidation.validateField(confirmNewPassword, 'confirmPassword', 'confirmPassword', false, null, newPassword)) {
            return;
        }

        fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/password/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setErrorMsg(data.error);
            } else {
                router.replace('/login');
            }
        })
        .then(() => {
            router.replace('/login');
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
                scrollEnabled={isPasswordFocused}>
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Reset Password' />
                    <ErrorMsg content={errorMsg} display={errorMsg !== ''} />

                    <View className='flex gap-6 w-full justify-center items-center mt-36'>
                        <View className='flex flex-col gap-2 w-full justify-center items-center'>
                            <Text className='font-spacemono-bold text-lg'>New Password</Text>
                            <TextInput
                                placeholder="New Password"
                                inputMode='text'
                                textContentType='password'
                                secureTextEntry={true}
                                clearButtonMode='while-editing'
                                onFocus={() => formValidation.handleInputFocus('password')}
                                onBlur={() => formValidation.handleInputBlur('password', newPassword, 'password')}
                                returnKeyType='next'
                                enablesReturnKeyAutomatically={true}
                                autoCorrect={false}
                                placeholderTextColor='gray'
                                onChangeText={(text) => formValidation.handleInputChange(text, setNewPassword)}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isPasswordError ? 'border-2 border-red-500' : ''
                                } ${isPasswordFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>

                        <View className='flex flex-col gap-2 w-full justify-center items-center'>
                            <Text className='font-spacemono-bold text-lg'>Confirm Password</Text>
                            <TextInput
                                placeholder="Confirm Password"
                                secureTextEntry={true}
                                clearButtonMode='while-editing'
                                onFocus={() => formValidation.handleInputFocus('confirmPassword')}
                                onBlur={() => formValidation.handleInputBlur('confirmPassword', confirmNewPassword, 'confirmPassword')}
                                returnKeyType='done'
                                enablesReturnKeyAutomatically={true}
                                autoCorrect={false}
                                placeholderTextColor='gray'
                                onChangeText={(text) => formValidation.handleInputChange(text, setConfirmNewPassword)}
                                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                                    isConfirmPasswordError ? 'border-2 border-red-500' : ''
                                } ${isConfirmPasswordFocused ? 'border-2 border-primary' : ''}`}
                            />
                        </View>
                    </View>

                    <MainButton 
                        content='Confirm' 
                        backgroundColor='bg-primary' 
                        onPressAction={handleResetPassword} 
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

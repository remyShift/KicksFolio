import { View, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef } from 'react';
import PageTitle from '@/components/text/PageTitle';
import MainButton from '@/components/buttons/MainButton';
import ErrorMsg from '@/components/text/ErrorMsg';
import { checkPassword, checkConfirmPassword } from '@/scripts/formUtils';

export default function ResetPassword() {
    const { token } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);

    const handleResetPassword = () => {
        if (!checkPassword(newPassword, setErrorMsg, setIsPasswordError)) {
            return;
        }

        if (!checkConfirmPassword(newPassword, confirmPassword, setErrorMsg, setIsConfirmPasswordError)) {
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Reset Password' />
                    <ErrorMsg content={errorMsg} display={errorMsg !== ''} />

                    <View className='flex gap-4 w-full'>
                        <TextInput
                            className={`w-full h-12 px-4 rounded-lg bg-white ${isPasswordError ? 'border-2 border-red-500' : ''}`}
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                setIsPasswordError(false);
                                setErrorMsg('');
                            }}
                        />

                        <TextInput
                            className={`w-full h-12 px-4 rounded-lg bg-white ${isConfirmPasswordError ? 'border-2 border-red-500' : ''}`}
                            placeholder="Confirm Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setIsConfirmPasswordError(false);
                                setErrorMsg('');
                            }}
                        />
                    </View>

                    <MainButton 
                        content='Reset Password' 
                        backgroundColor='bg-primary' 
                        onPressAction={handleResetPassword} 
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

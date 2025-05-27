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

export default function LoginForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErrorMsg, setEmailErrorMsg] = useState('');
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const { login } = useAuth();

    const errorMsg = emailErrorMsg || passwordErrorMsg;

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
                        <EmailInput
                            inputRef={emailInputRef}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setEmailErrorMsg}
                            onValueChange={setEmail}
                        />
                        
                        <PasswordInput
                            inputRef={passwordInputRef}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setPasswordErrorMsg}
                            onValueChange={setPassword}
                            title='*Password'
                        />
                    </View>
                    <View className='flex gap-5 w-full justify-center items-center'>                      
                        <MainButton content='Login' backgroundColor='bg-primary' onPressAction={() => login(email, password)} />
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

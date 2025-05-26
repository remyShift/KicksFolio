import ErrorMsg from "@/components/ui/text/ErrorMsg";
import PageTitle from "@/components/ui/text/PageTitle";
import { TextInput, View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import MainButton from "@/components/ui/buttons/MainButton";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import EmailInput from "@/components/ui/inputs/EmailInput";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [emailErrorMsg, setEmailErrorMsg] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);

    const { forgotPassword } = useAuth();

    const errorMsg = emailErrorMsg;

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
                    <PageTitle content='Forgot Password' />
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
                    </View>
                    <View className='flex gap-5 w-full justify-center items-center'>                      
                        <MainButton content='Send Reset Link' backgroundColor='bg-primary' onPressAction={() => forgotPassword(email)} />
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
    )
}

import { TextInput, Text, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import PageTitle from "@/components/ui/text/PageTitle"
import ErrorMsg from "@/components/ui/text/ErrorMsg"
import MainButton from "@/components/ui/buttons/MainButton"
import { useState, useRef } from "react"
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import PasswordInput from "@/components/ui/inputs/authForm/PasswordInput";
import ConfirmPasswordInput from "@/components/ui/inputs/authForm/ConfirmPasswordInput";
import { useSignUpProps } from "@/context/signUpPropsContext";

export default function ResetPasswordForm() {
    const { token } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('')
    const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState('')
    const scrollViewRef = useRef<ScrollView>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    
    const { signUpProps, setSignUpProps } = useSignUpProps();
    
    const errorMsg = passwordErrorMsg || confirmPasswordErrorMsg;
    
    const { resetPassword } = useAuth();

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
                    <PageTitle content='Reset Password' />
                    <ErrorMsg content={errorMsg} display={errorMsg !== ''} />

                    <View className='flex gap-6 w-full justify-center items-center mt-36'>
                        <PasswordInput
                            inputRef={passwordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setPasswordErrorMsg}
                            onValueChange={setNewPassword}
                            title='*New Password'
                        />

                        <ConfirmPasswordInput
                            inputRef={confirmPasswordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            scrollViewRef={scrollViewRef}
                            onErrorChange={setConfirmPasswordErrorMsg}
                            onValueChange={setConfirmNewPassword}
                        />
                    </View>

                    <MainButton 
                        content='Confirm' 
                        backgroundColor='bg-primary' 
                        onPressAction={() => resetPassword(token as string, newPassword, confirmNewPassword)} 
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

import { TextInput, Text, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import PageTitle from "@/components/ui/text/PageTitle"
import ErrorMsg from "@/components/ui/text/ErrorMsg"
import MainButton from "@/components/ui/buttons/MainButton"
import { useState, useRef } from "react"
import { useLocalSearchParams } from "expo-router";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordForm() {
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { token } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false)
    const [isPasswordError, setIsPasswordError] = useState(false)
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false)

    const { resetPassword } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);

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
                        <PasswordInput
                            inputRef={passwordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            isPasswordError={isPasswordError}
                            isPasswordFocused={isPasswordFocused}
                            title='New Password'
                        />

                        <ConfirmPasswordInput
                            inputRef={confirmPasswordInputRef}
                            signUpProps={signUpProps}
                            setSignUpProps={setSignUpProps}
                            isConfirmPasswordError={isConfirmPasswordError}
                            isConfirmPasswordFocused={isConfirmPasswordFocused}
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

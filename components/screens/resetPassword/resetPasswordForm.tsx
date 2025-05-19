import { TextInput, Text, View } from "react-native";
import PageTitle from "@/components/ui/text/PageTitle"
import ErrorMsg from "@/components/ui/text/ErrorMsg"
import MainButton from "@/components/ui/buttons/MainButton"
import { useState } from "react"
import { FormService } from "@/services/FormService"
import { FormValidationService } from "@/services/FormValidationService"
import { router, useLocalSearchParams } from "expo-router";
import { authService } from "@/services/AuthService";

interface ResetPasswordFormProps {  
    setIsPasswordFocused: (isFocused: boolean) => void,
    isPasswordFocused: boolean
}

export default function ResetPasswordForm({ setIsPasswordFocused, isPasswordFocused }: ResetPasswordFormProps) {
    const { token } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false)
    const [isPasswordError, setIsPasswordError] = useState(false)
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false)

    const handleForm = new FormService(setErrorMsg, {
        password: setIsPasswordError,
        confirmPassword: setIsConfirmPasswordError
    }, {
        password: setIsPasswordFocused,
        confirmPassword: setIsConfirmPasswordFocused
    })

    const formValidation = new FormValidationService(setErrorMsg, {
        password: setIsPasswordError,
        confirmPassword: setIsConfirmPasswordError
    })


    const handleResetPassword = async () => {
        const success = await authService.handleResetPassword(
            token as string,
            newPassword,
            confirmNewPassword,
            formValidation
        );

        if (success) {
            router.replace('/login');
        }
    };

    return (
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
                        onFocus={() => handleForm.inputFocus('password')}
                        onBlur={() => handleForm.inputBlur('password', newPassword)}
                        returnKeyType='next'
                        enablesReturnKeyAutomatically={true}
                        autoCorrect={false}
                        placeholderTextColor='gray'
                        onChangeText={(text) => handleForm.inputChange(text, setNewPassword)}
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
                        onFocus={() => handleForm.inputFocus('confirmPassword')}
                        onBlur={() => handleForm.inputBlur('confirmPassword', confirmNewPassword)}
                        returnKeyType='done'
                        enablesReturnKeyAutomatically={true}
                        autoCorrect={false}
                        placeholderTextColor='gray'
                        onChangeText={(text) => handleForm.inputChange(text, setConfirmNewPassword)}
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
    )
}

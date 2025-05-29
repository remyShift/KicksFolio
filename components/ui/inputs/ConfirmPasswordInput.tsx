import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { UserData } from "@/types/Auth";

interface ConfirmPasswordProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export function ConfirmPasswordInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: ConfirmPasswordProps) {
    const [confirmPasswordValue, setConfirmPasswordValue] = useState(signUpProps.confirmPassword || "");
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

    const { formValidation, handleForm, errorMsg } = useForm({
        errorSetters: {
            confirmPassword: (isError: boolean) => setIsConfirmPasswordError(isError),
        },
        focusSetters: {
            confirmPassword: (isFocused: boolean) => setIsConfirmPasswordFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onValueChange(confirmPasswordValue);
    }, [confirmPasswordValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Confirm Password</Text>
            <TextInput
                ref={inputRef}
                value={confirmPasswordValue}
                placeholder="********"
                inputMode='text'
                textContentType='newPassword'
                clearButtonMode='while-editing'
                autoCorrect={false}
                secureTextEntry={true}
                placeholderTextColor='gray'
                returnKeyType='done'
                enablesReturnKeyAutomatically={true}
                onFocus={() => handleForm.inputFocus('confirmPassword')}
                onBlur={() => handleForm.inputBlur('confirmPassword', confirmPasswordValue)}
                onChangeText={(text) => {
                    setConfirmPasswordValue(text);
                    setSignUpProps({ ...signUpProps, confirmPassword: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, confirmPassword: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isConfirmPasswordError ? 'border-2 border-red-500' : ''
                } ${isConfirmPasswordFocused ? 'border-2 border-primary' : ''}`}
            />
            {errorMsg !== '' && (
                <Text className='text-red-500 text-xs'>{errorMsg}</Text>
            )}
        </View>
    )
}
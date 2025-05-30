import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface ConfirmPasswordInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange?: (value: string) => void;
}

export default function ConfirmPasswordInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: ConfirmPasswordInputProps) {
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
    const [confirmPasswordValue, setConfirmPasswordValue] = useState(signUpProps?.confirmPassword || "");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            confirmPassword: (isError: boolean) => setIsConfirmPasswordError(isError),
        },
        focusSetters: {
            confirmPassword: (isFocused: boolean) => setIsConfirmPasswordFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange?.(confirmPasswordValue);
    }, [confirmPasswordValue, onValueChange]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*Confirm Password</Text>
        <TextInput
            ref={inputRef}
            placeholder="********"
            inputMode='text'
            value={confirmPasswordValue}
            autoComplete='off'
            textContentType='password'
            autoCorrect={false}
            secureTextEntry={true}
            placeholderTextColor='gray'
            clearButtonMode='while-editing'
            returnKeyType='done'
            enablesReturnKeyAutomatically={true}
            onFocus={() => handleForm.inputFocus('confirmPassword')}
            onBlur={() => handleForm.inputBlur('confirmPassword', confirmPasswordValue)}
            onChangeText={(text) => {
                setConfirmPasswordValue(text);
                setSignUpProps?.({ ...signUpProps!, confirmPassword: text });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, confirmPassword: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isConfirmPasswordError ? 'border-2 border-red-500' : ''
            } ${isConfirmPasswordFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}
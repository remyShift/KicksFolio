import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/Auth";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface PasswordInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    title: string;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function PasswordInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, title, onErrorChange, onValueChange }: PasswordInputProps) {
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [passwordValue, setPasswordValue] = useState(signUpProps?.password || "");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            password: (isError: boolean) => setIsPasswordError(isError),
        },
        focusSetters: {
            password: (isFocused: boolean) => setIsPasswordFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(passwordValue);
    }, [passwordValue]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*{title}</Text>
        <Text className='font-spacemono-bold text-sm text-center px-6 text-gray-600'>
            At least one uppercase letter and one number and be 8 characters long.
        </Text>
        <TextInput
            ref={inputRef}
            value={passwordValue}
            placeholder="********"
            inputMode='text'
            textContentType='newPassword'
            passwordRules='{ "minLength": 8, "requiresUppercase": true, "requiresLowercase": true, "requiresNumeric": true }'
            clearButtonMode='while-editing'
            autoCorrect={false}
            secureTextEntry={true}
            placeholderTextColor='gray'
            returnKeyType='next'
            enablesReturnKeyAutomatically={true}
            onFocus={() => handleForm.inputFocus('password')}
            onBlur={() => handleForm.inputBlur('password', passwordValue)}
            onChangeText={(text) => {
                setPasswordValue(text);
                setSignUpProps?.({ ...signUpProps!, password: text });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, password: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isPasswordError ? 'border-2 border-red-500' : ''
            } ${isPasswordFocused ? 'border-2 border-primary' : ''}`}
        />
        {errorMsg !== '' && (
            <Text className='text-red-500 text-xs'>{errorMsg}</Text>
        )}
    </View>
    )
}
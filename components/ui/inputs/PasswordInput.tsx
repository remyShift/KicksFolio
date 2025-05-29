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
    const [passwordValue, setPasswordValue] = useState(signUpProps?.password || "");
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const { formValidation, handleForm, errorMsg } = useForm({
        errorSetters: {
            password: (isError: boolean) => setIsPasswordError(isError),
        },
        focusSetters: {
            password: (isFocused: boolean) => setIsPasswordFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onValueChange(passwordValue);
    }, [passwordValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*{title}</Text>
        <TextInput
            ref={inputRef}
            value={passwordValue}
            placeholder="********"
            inputMode='text'
            textContentType='newPassword'
            placeholderTextColor='gray'
            returnKeyType='next'
            enablesReturnKeyAutomatically={true}
            onSubmitEditing={() => formValidation.validateField(passwordValue, 'password')}
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
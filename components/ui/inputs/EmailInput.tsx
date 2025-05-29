import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { UserData } from "@/types/Auth";

interface EmailInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function EmailInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: EmailInputProps) {
    const [emailValue, setEmailValue] = useState(signUpProps.email || "");
    const [isEmailError, setIsEmailError] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);

    const { formValidation, handleForm, errorMsg } = useForm({
        errorSetters: {
            email: (isError: boolean) => setIsEmailError(isError),
        },
        focusSetters: {
            email: (isFocused: boolean) => setIsEmailFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onValueChange(emailValue);
    }, [emailValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Email</Text>
            <TextInput
                ref={inputRef}
                placeholder="johndoe@gmail.com"
                inputMode='email'
                value={emailValue}
                autoComplete='email'
                textContentType='emailAddress'
                autoCorrect={false}
                placeholderTextColor='gray'
                clearButtonMode='while-editing'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => formValidation.validateField(emailValue, 'email')}
                onFocus={() => handleForm.inputFocus('email')}
                onBlur={() => handleForm.inputBlur('email', emailValue)}
                onChangeText={(text) => {
                    setEmailValue(text);
                    setSignUpProps({ ...signUpProps, email: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, email: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isEmailError ? 'border-2 border-red-500' : ''
                } ${isEmailFocused ? 'border-2 border-primary' : ''}`}
            />
            {errorMsg !== '' && (
                <Text className='text-red-500 text-xs'>{errorMsg}</Text>
            )}
        </View>
    )
}
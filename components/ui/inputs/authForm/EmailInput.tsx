import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useFormErrors } from "@/context/formErrorsContext";

interface EmailInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange?: (value: string) => void;
    isLoginPage?: boolean;
    nextInputRef?: React.RefObject<TextInput>;
    isError?: boolean;
}

export default function EmailInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange, isLoginPage, nextInputRef, isError = false }: EmailInputProps) {
    const [isEmailError, setIsEmailError] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [emailValue, setEmailValue] = useState(signUpProps?.email || "");
    const { clearErrors } = useFormErrors();

    const { handleForm, errorMsg } = useForm({
            errorSetters: {
                email: (isError: boolean) => setIsEmailError(isError),
            },
            focusSetters: {
                email: (isFocused: boolean) => setIsEmailFocused(isFocused),
            },
            scrollViewRef
        });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange?.(emailValue);
    }, [emailValue, onValueChange]);

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
            onSubmitEditing={() => {
                if (nextInputRef) {
                    handleForm.inputBlur('email', emailValue, isLoginPage)
                        .then((isValid) => {
                            if (isValid) {
                                nextInputRef.current?.focus();
                            }
                        });
                }
            }}
            enablesReturnKeyAutomatically={true}
            onFocus={() => {
                handleForm.inputFocus('email');
                clearErrors();
            }}
            onBlur={() => handleForm.inputBlur('email', emailValue, isLoginPage)}
            onChangeText={(text) => {
                setEmailValue(text);
                setSignUpProps?.({ ...signUpProps!, email: text });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, email: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                (isEmailError || isError) ? 'border-2 border-red-500' : ''
            } ${isEmailFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}
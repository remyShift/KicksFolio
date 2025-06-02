import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface FirstNameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange?: (value: string) => void;
    nextInputRef?: React.RefObject<TextInput>;
}

export default function FirstNameInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange, nextInputRef }: FirstNameInputProps) {
    const [isFirstNameError, setIsFirstNameError] = useState(false);
    const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
    const [firstNameValue, setFirstNameValue] = useState(signUpProps?.first_name || "");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            firstName: (isError: boolean) => setIsFirstNameError(isError),
        },
        focusSetters: {
            firstName: (isFocused: boolean) => setIsFirstNameFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange?.(firstNameValue);
    }, [firstNameValue, onValueChange]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*First Name</Text>
        <TextInput
            ref={inputRef}
            placeholder="John"
            inputMode='text'
            value={firstNameValue}
            autoComplete='name'
            textContentType='givenName'
            autoCorrect={false}
            placeholderTextColor='gray'
            clearButtonMode='while-editing'
            returnKeyType='next'
            onSubmitEditing={() => {
                if (nextInputRef) {
                    nextInputRef.current?.focus();
                }
            }}
            enablesReturnKeyAutomatically={true}
            onFocus={() => handleForm.inputFocus('firstName')}
            onBlur={() => handleForm.inputBlur('firstName', firstNameValue)}
            onChangeText={(text) => {
                setFirstNameValue(text);
                setSignUpProps?.({ ...signUpProps!, first_name: text });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, first_name: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isFirstNameError ? 'border-2 border-red-500' : ''
            } ${isFirstNameFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}
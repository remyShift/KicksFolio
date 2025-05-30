import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface LastNameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange?: (value: string) => void;
}

export default function LastNameInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: LastNameInputProps) {
    const [isLastNameError, setIsLastNameError] = useState(false);
    const [isLastNameFocused, setIsLastNameFocused] = useState(false);
    const [lastNameValue, setLastNameValue] = useState(signUpProps?.last_name || "");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            lastName: (isError: boolean) => setIsLastNameError(isError),
        },
        focusSetters: {
            lastName: (isFocused: boolean) => setIsLastNameFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange?.(lastNameValue);
    }, [lastNameValue, onValueChange]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*Last Name</Text>
        <TextInput
            ref={inputRef}
            placeholder="Doe"
            inputMode='text'
            value={lastNameValue}
            autoComplete='name'
            textContentType='familyName'
            autoCorrect={false}
            placeholderTextColor='gray'
            clearButtonMode='while-editing'
            returnKeyType='next'
            enablesReturnKeyAutomatically={true}
            onFocus={() => handleForm.inputFocus('lastName')}
            onBlur={() => handleForm.inputBlur('lastName', lastNameValue)}
            onChangeText={(text) => {
                setLastNameValue(text);
                setSignUpProps?.({ ...signUpProps!, last_name: text });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, last_name: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isLastNameError ? 'border-2 border-red-500' : ''
            } ${isLastNameFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}
import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, Platform, ScrollView } from "react-native";
import { UserData } from "@/types/Auth";

interface FirstNameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function FirstNameInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: FirstNameInputProps) {
    const [firstNameValue, setFirstNameValue] = useState(signUpProps.first_name || "");
    const [isFirstNameError, setIsFirstNameError] = useState(false);
    const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);

    const { formValidation, handleForm, errorMsg } = useForm({
        errorSetters: {
            firstName: (isError: boolean) => setIsFirstNameError(isError),
        },
        focusSetters: {
            firstName: (isFocused: boolean) => setIsFirstNameFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onValueChange(firstNameValue);
    }, [firstNameValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*First Name</Text>
            <TextInput
                placeholder="John"
                inputMode='text'
                textContentType='givenName'
                clearButtonMode='while-editing'
                ref={inputRef}
                value={firstNameValue}
                autoComplete={Platform.OS === 'ios' ? 'cc-name' : 'name-given'}
                autoCorrect={false}
                placeholderTextColor='gray'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => formValidation.validateField(firstNameValue, 'firstName')}
                onFocus={() => handleForm.inputFocus('firstName')}
                onBlur={() => handleForm.inputBlur('firstName', firstNameValue)}
                onChangeText={(text) => {
                    setFirstNameValue(text);
                    setSignUpProps({ ...signUpProps, first_name: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, first_name: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isFirstNameError ? 'border-2 border-red-500' : ''
                } ${isFirstNameFocused ? 'border-2 border-primary' : ''}`}
            />
            {errorMsg !== '' && (
                <Text className='text-red-500 text-xs'>{errorMsg}</Text>
            )}
        </View>
    )
}
import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, Platform, ScrollView } from "react-native";
import { UserData } from "@/types/Auth";

interface LastNameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function LastNameInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: LastNameInputProps) {
    const [lastNameValue, setLastNameValue] = useState(signUpProps.last_name || "");
    const [isLastNameError, setIsLastNameError] = useState(false);
    const [isLastNameFocused, setIsLastNameFocused] = useState(false);

    const { formValidation, handleForm, errorMsg } = useForm({
        errorSetters: {
            lastName: (isError: boolean) => setIsLastNameError(isError),
        },
        focusSetters: {
            lastName: (isFocused: boolean) => setIsLastNameFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onValueChange(lastNameValue);
    }, [lastNameValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Last Name</Text>
            <TextInput
                placeholder="Doe"
                inputMode='text'
                textContentType='familyName'
                clearButtonMode='while-editing'
                ref={inputRef}
                value={lastNameValue}
                autoComplete={Platform.OS === 'ios' ? 'cc-name' : 'name-family'}
                autoCorrect={false}
                placeholderTextColor='gray'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => formValidation.validateField(lastNameValue, 'lastName')}
                onFocus={() => handleForm.inputFocus('lastName')}
                onBlur={() => handleForm.inputBlur('lastName', lastNameValue)}
                onChangeText={(text) => {
                    setLastNameValue(text);
                    setSignUpProps({ ...signUpProps, last_name: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, last_name: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isLastNameError ? 'border-2 border-red-500' : ''
                } ${isLastNameFocused ? 'border-2 border-primary' : ''}`}
            />
            {errorMsg !== '' && (
                <Text className='text-red-500 text-xs'>{errorMsg}</Text>
            )}
        </View>
    )
}
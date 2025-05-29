import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { UserData } from "@/types/Auth";

interface UsernameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export default function UsernameInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: UsernameInputProps) {
    const [usernameValue, setUsernameValue] = useState(signUpProps.username || "");
    const [isUsernameError, setIsUsernameError] = useState(false);
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);

    const { formValidation, handleForm, errorMsg } = useForm({
        errorSetters: {
            username: (isError: boolean) => setIsUsernameError(isError),
        },
        focusSetters: {
            username: (isFocused: boolean) => setIsUsernameFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onValueChange(usernameValue);
    }, [usernameValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <TextInput
                placeholder="johndoe42"
                inputMode='text'
                ref={inputRef}
                value={usernameValue}
                autoComplete='username'
                textContentType='username'
                clearButtonMode='while-editing'
                autoCorrect={false}
                placeholderTextColor='gray'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => formValidation.validateField(usernameValue, 'username')}
                onFocus={() => handleForm.inputFocus('username')}
                onBlur={() => handleForm.inputBlur('username', usernameValue)}
                onChangeText={(text) => {
                    setUsernameValue(text);
                    setSignUpProps({ ...signUpProps, username: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, username: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isUsernameError ? 'border-2 border-red-500' : ''
                } ${isUsernameFocused ? 'border-2 border-primary' : ''}`}
            />
            {errorMsg !== '' && (
                <Text className='text-red-500 text-xs'>{errorMsg}</Text>
            )}
        </View>
    )
}
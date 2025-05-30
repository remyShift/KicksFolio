import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface UsernameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps?: UserData;
    setSignUpProps?: (props: UserData) => void;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange?: (value: string) => void;
}

export default function UsernameInput({ inputRef, signUpProps, setSignUpProps, scrollViewRef, onErrorChange, onValueChange }: UsernameInputProps) {
    const [isUsernameError, setIsUsernameError] = useState(false);
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [usernameValue, setUsernameValue] = useState(signUpProps?.username || "");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            username: (isError: boolean) => setIsUsernameError(isError),
        },
        focusSetters: {
            username: (isFocused: boolean) => setIsUsernameFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange?.(usernameValue);
    }, [usernameValue, onValueChange]);

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*Username</Text>
        <TextInput
            ref={inputRef}
            placeholder="johndoe"
            inputMode='text'
            value={usernameValue}
            autoComplete='username'
            textContentType='username'
            autoCorrect={false}
            placeholderTextColor='gray'
            clearButtonMode='while-editing'
            returnKeyType='next'
            enablesReturnKeyAutomatically={true}
            onFocus={() => handleForm.inputFocus('username')}
            onBlur={() => handleForm.inputBlur('username', usernameValue)}
            onChangeText={(text) => {
                setUsernameValue(text);
                setSignUpProps?.({ ...signUpProps!, username: text });
                handleForm.inputChange(text, (t) => setSignUpProps?.({ ...signUpProps!, username: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isUsernameError ? 'border-2 border-red-500' : ''
            } ${isUsernameFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}
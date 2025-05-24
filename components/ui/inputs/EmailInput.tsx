import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";
import { Text, TextInput, View, ScrollView } from "react-native";

interface EmailInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    isEmailError: boolean;
    isEmailFocused: boolean;
    scrollViewRef: React.RefObject<ScrollView>;
    setIsEmailError: (isError: boolean) => void;
    setIsEmailFocused: (isFocused: boolean) => void;
}

export default function EmailInput({ inputRef, signUpProps, setSignUpProps, isEmailError, isEmailFocused, scrollViewRef, setIsEmailError, setIsEmailFocused }: EmailInputProps) {
    const { formValidation, handleForm } = useForm(
        {
            errorSetters: {
                email: (isError: boolean) => setIsEmailError(isError),
            },
            focusSetters: {
                email: (isFocused: boolean) => setIsEmailFocused(isFocused),
            },
            scrollViewRef
        }
    );

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*Email</Text>
        <TextInput
            ref={inputRef}
            placeholder="johndoe@gmail.com"
            inputMode='email'
            value={signUpProps.email}
            autoComplete='email'
            textContentType='emailAddress'
            autoCorrect={false}
            placeholderTextColor='gray'
            clearButtonMode='while-editing'
            returnKeyType='next'
            enablesReturnKeyAutomatically={true}
            onSubmitEditing={() => formValidation.validateField(signUpProps.email, 'email')}
            onFocus={() => handleForm.inputFocus('email')}
            onBlur={() => handleForm.inputBlur('email', signUpProps.email)}
            onChangeText={(text) => {
                setSignUpProps({ ...signUpProps, email: text });
                handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, email: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isEmailError ? 'border-2 border-red-500' : ''
            } ${isEmailFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}
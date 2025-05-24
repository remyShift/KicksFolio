import { TextInput, View, ScrollView } from "react-native";
import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/Auth";

interface UsernameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    isUsernameError: boolean;
    isUsernameFocused: boolean;
    scrollViewRef: React.RefObject<ScrollView>;
    setIsUsernameError: (isError: boolean) => void;
    setIsUsernameFocused: (isFocused: boolean) => void;
}

export default function UsernameInput({ inputRef, signUpProps, setSignUpProps, isUsernameError, isUsernameFocused, scrollViewRef, setIsUsernameError, setIsUsernameFocused }: UsernameInputProps) {
    const { formValidation, handleForm } = useForm({
        errorSetters: {
            username: (isError: boolean) => setIsUsernameError(isError),
        },
        focusSetters: {
            username: (isFocused: boolean) => setIsUsernameFocused(isFocused),
        },
        scrollViewRef
    });

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <TextInput
                placeholder="johndoe42"
                inputMode='text'
                ref={inputRef}
                value={signUpProps.username}
                autoComplete='username'
                textContentType='username'
                clearButtonMode='while-editing'
                autoCorrect={false}
                placeholderTextColor='gray'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => formValidation.validateField(signUpProps.username, 'username')}
                onFocus={() => handleForm.inputFocus('username')}
                onBlur={() => handleForm.inputBlur('username', signUpProps.username)}
                onChangeText={(text) => {
                    setSignUpProps({ ...signUpProps, username: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, username: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isUsernameError ? 'border-2 border-red-500' : ''
                } ${isUsernameFocused ? 'border-2 border-primary' : ''}`}
            />
        </View>
    )
}
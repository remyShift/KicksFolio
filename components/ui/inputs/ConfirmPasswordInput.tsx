import { useForm } from "@/hooks/useForm";
import { Text, TextInput, View, ScrollView } from "react-native";

interface ConfirmPasswordProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: SignUpProps;
    setSignUpProps: (props: SignUpProps) => void;
    isConfirmPasswordError: boolean;
    isConfirmPasswordFocused: boolean;
    scrollViewRef: React.RefObject<ScrollView>;
}

export function ConfirmPasswordInput({ inputRef, signUpProps, setSignUpProps, isConfirmPasswordError, isConfirmPasswordFocused, scrollViewRef }: ConfirmPasswordProps) {
    const { formValidation, handleForm } = useForm({
        errorSetters: {
            confirmPassword: (isError: boolean) => setIsConfirmPasswordError(isError),
        },
        focusSetters: {
            confirmPassword: (isFocused: boolean) => setIsConfirmPasswordFocused(isFocused),
        },
        scrollViewRef
    });

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Confirm Password</Text>
            <TextInput
                ref={inputRef}
                value={signUpProps.confirmPassword}
                placeholder="********"
                inputMode='text'
                textContentType='newPassword'
                clearButtonMode='while-editing'
                autoCorrect={false}
                secureTextEntry={true}
                placeholderTextColor='gray'
                returnKeyType='done'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={handleNextSignupPage}
                onFocus={() => handleForm.inputFocus('confirmPassword')}
                onBlur={() => handleForm.inputBlur('confirmPassword', signUpProps.confirmPassword)}
                onChangeText={(text) => {
                    setSignUpProps({ ...signUpProps, confirmPassword: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, confirmPassword: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isConfirmPasswordError ? 'border-2 border-red-500' : ''
                } ${isConfirmPasswordFocused ? 'border-2 border-primary' : ''}`}
            />
        </View>
    )
}
import { useForm } from "@/hooks/useForm";
import { Text, TextInput, View, ScrollView } from "react-native";

interface PasswordInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: SignUpProps;
    setSignUpProps: (props: SignUpProps) => void;
    isPasswordError: boolean;
    isPasswordFocused: boolean;
    scrollViewRef: React.RefObject<ScrollView>;
    title: string;
}

export function PasswordInput({ inputRef, signUpProps, setSignUpProps, isPasswordError, isPasswordFocused, scrollViewRef, title }: PasswordInputProps) {
    const { formValidation, handleForm } = useForm({
        errorSetters: {
            password: (isError: boolean) => setIsPasswordError(isError),
        },
        focusSetters: {
            password: (isFocused: boolean) => setIsPasswordFocused(isFocused),
        },
        scrollViewRef
    });

    return (
    <View className='flex flex-col gap-2 w-full justify-center items-center'>
        <Text className='font-spacemono-bold text-lg'>*{title}</Text>
        <Text className='font-spacemono-bold text-sm text-center px-6 text-gray-600'>
            At least one uppercase letter and one number and be 8 characters long.
        </Text>
        <TextInput
            ref={inputRef}
            value={signUpProps.password}
            placeholder="********"
            inputMode='text'
            textContentType='newPassword'
            passwordRules='{ "minLength": 8, "requiresUppercase": true, "requiresLowercase": true, "requiresNumeric": true }'
            clearButtonMode='while-editing'
            autoCorrect={false}
            secureTextEntry={true}
            placeholderTextColor='gray'
            returnKeyType='next'
            enablesReturnKeyAutomatically={true}
            onSubmitEditing={() => formValidation.validateField(signUpProps.password, 'password')}
            onFocus={() => handleForm.inputFocus('password')}
            onBlur={() => handleForm.inputBlur('password', signUpProps.password)}
            onChangeText={(text) => {
                setSignUpProps({ ...signUpProps, password: text });
                handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, password: t }));
            }}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isPasswordError ? 'border-2 border-red-500' : ''
            } ${isPasswordFocused ? 'border-2 border-primary' : ''}`}
        />
    </View>
    )
}
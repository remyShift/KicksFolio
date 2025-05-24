import { Text, TextInput, View, Platform, ScrollView } from "react-native";
import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/Auth";

interface FirstNameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    isFirstNameError: boolean;
    isFirstNameFocused: boolean;
    scrollViewRef: React.RefObject<ScrollView>;
    setIsFirstNameError: (isError: boolean) => void;
    setIsFirstNameFocused: (isFocused: boolean) => void;
}

export default function FirstNameInput({ inputRef, signUpProps, setSignUpProps, isFirstNameError, isFirstNameFocused, scrollViewRef, setIsFirstNameError, setIsFirstNameFocused }: FirstNameInputProps) {
    const { formValidation, handleForm } = useForm(
        {
            errorSetters: {
                firstName: (isError: boolean) => setIsFirstNameError(isError),
            },
            focusSetters: {
                firstName: (isFocused: boolean) => setIsFirstNameFocused(isFocused),
            },
            scrollViewRef
        }
    );

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*First Name</Text>
            <TextInput
                placeholder="John"
                inputMode='text'
                textContentType='givenName'
                clearButtonMode='while-editing'
                ref={inputRef}
                value={signUpProps.first_name}
                autoComplete={Platform.OS === 'ios' ? 'cc-name' : 'name-given'}
                autoCorrect={false}
                placeholderTextColor='gray'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => formValidation.validateField(signUpProps.first_name, 'firstName')}
                onFocus={() => handleForm.inputFocus('firstName')}
                onBlur={() => handleForm.inputBlur('firstName', signUpProps.first_name)}
                onChangeText={(text) => {
                    setSignUpProps({ ...signUpProps, first_name: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, first_name: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isFirstNameError ? 'border-2 border-red-500' : ''
                } ${isFirstNameFocused ? 'border-2 border-primary' : ''}`}
            />
        </View>
    )
}
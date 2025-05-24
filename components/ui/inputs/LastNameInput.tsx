import { Text, TextInput, View, Platform, ScrollView } from "react-native";
import { useForm } from "@/hooks/useForm";
import { UserData } from "@/types/auth";

interface LastNameInputProps {
    inputRef: React.RefObject<TextInput>;
    signUpProps: UserData;
    setSignUpProps: (props: UserData) => void;
    isLastNameError: boolean;
    isLastNameFocused: boolean;
    scrollViewRef: React.RefObject<ScrollView>;
    setIsLastNameError: (isError: boolean) => void;
    setIsLastNameFocused: (isFocused: boolean) => void;
}

export default function LastNameInput({ inputRef, signUpProps, setSignUpProps, isLastNameError, isLastNameFocused, scrollViewRef, setIsLastNameError, setIsLastNameFocused }: LastNameInputProps) {
    const { formValidation, handleForm } = useForm(
        {
            errorSetters: {
                lastName: (isError: boolean) => setIsLastNameError(isError),
            },
            focusSetters: {
                lastName: (isFocused: boolean) => setIsLastNameFocused(isFocused),
            },
            scrollViewRef
        }
    );

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Last Name</Text>
            <TextInput
                placeholder="Doe"
                inputMode='text'
                textContentType='familyName'
                clearButtonMode='while-editing'
                ref={inputRef}
                value={signUpProps.last_name}
                autoComplete={Platform.OS === 'ios' ? 'cc-name' : 'name-family'}
                autoCorrect={false}
                placeholderTextColor='gray'
                returnKeyType='next'
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => formValidation.validateField(signUpProps.last_name, 'lastName')}
                onFocus={() => handleForm.inputFocus('lastName')}
                onBlur={() => handleForm.inputBlur('lastName', signUpProps.last_name)}
                onChangeText={(text) => {
                    setSignUpProps({ ...signUpProps, last_name: text });
                    handleForm.inputChange(text, (t) => setSignUpProps({ ...signUpProps, last_name: t }));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isLastNameError ? 'border-2 border-red-500' : ''
                } ${isLastNameFocused ? 'border-2 border-primary' : ''}`}
            />
        </View>
    )
}
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSignUpProps } from '@/context/signUpPropsContext';
import { useRef } from 'react';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import FormImageInput from '@/components/ui/inputs/FormImageInput';
import MainButton from '@/components/ui/buttons/MainButton';
import { useAuth } from '@/hooks/useAuth';
import PageTitle from '@/components/ui/text/PageTitle';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useFormController } from '@/hooks/useFormController';
import { signUpStep2Schema, SignUpStep2FormData } from '@/validation/schemas';
import { Link } from 'expo-router';

export default function SignUpSecondForm() {
    const { signUpProps, setSignUpProps } = useSignUpProps();
    const scrollViewRef = useRef<ScrollView>(null);
    const lastNameInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const firstNameInputRef = useRef<TextInput>(null);

    const { signUp } = useAuth();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
        isSubmitDisabled,
    } = useFormController<SignUpStep2FormData>({
        schema: signUpStep2Schema,
        defaultValues: {
            firstName: signUpProps.first_name || '',
            lastName: signUpProps.last_name || '',
            size: signUpProps.sneaker_size ? String(signUpProps.sneaker_size) : '',
            profile_picture: signUpProps.profile_picture || '',
        },
        onSubmit: async (data) => {
            const updatedSignUpProps = {
                ...signUpProps,
                first_name: data.firstName,
                last_name: data.lastName,
                sneaker_size: data.size ? Number(data.size) : 0,
                profile_picture: data.profile_picture,
            };
            
            setSignUpProps(updatedSignUpProps);
            signUp(updatedSignUpProps);
        },
    });

    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName as keyof typeof signUpStep2Schema._type);
    };

    const hasMultipleErrors = [
        hasFieldError('firstName'),
        hasFieldError('lastName'),
        hasFieldError('size'),
    ].filter(Boolean).length > 1;

    const globalErrorMsg = hasMultipleErrors 
        ? 'Please correct the fields in red before continuing'
        : '';

    const displayedError = globalErrorMsg || 
        getFieldError('firstName') || 
        getFieldError('lastName') || 
        getFieldError('size') || 
        '';

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 items-center gap-12 p-4">
                    <PageTitle content='Sign Up' />
                    <View className='flex gap-6 justify-center items-center w-full mt-8 px-12'>
                    <View className='w-full absolute' style={{ top: -50 }}>   
                            <ErrorMsg content={displayedError} display={displayedError !== ''} />
                        </View>
                        <FormImageInput
                            name="profile_picture"
                            control={control}
                            isRounded={true}
                            size={128}
                        />

                        <FormTextInput
                            name="firstName"
                            control={control}
                            label="*First Name"
                            placeholder="First Name"
                            ref={firstNameInputRef}
                            nextInputRef={lastNameInputRef}
                            autoComplete="name"
                            autoCapitalize="words"
                            onFocus={() => handleFieldFocus('firstName')}
                            onBlur={async (value) => { await validateFieldOnBlur('firstName', value); }}
                            error={getFieldErrorWrapper('firstName')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <FormTextInput
                            name="lastName"
                            control={control}
                            label="*Last Name"
                            placeholder="Last Name"
                            ref={lastNameInputRef}
                            nextInputRef={sizeInputRef}
                            autoComplete="name"
                            autoCapitalize="words"
                            onFocus={() => handleFieldFocus('lastName')}
                            onBlur={async (value) => { await validateFieldOnBlur('lastName', value); }}
                            error={getFieldErrorWrapper('lastName')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <FormTextInput
                            name="size"
                            control={control}
                            label="*Sneaker Size"
                            placeholder="42"
                            ref={sizeInputRef}
                            keyboardType="numeric"
                            onFocus={() => handleFieldFocus('size')}
                            onBlur={async (value) => { await validateFieldOnBlur('size', value); }}
                            onSubmitEditing={handleFormSubmit}
                            error={getFieldErrorWrapper('size')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <MainButton 
                            content='Sign Up' 
                            backgroundColor={isSubmitDisabled ? 'bg-gray-300' : 'bg-primary'}
                            onPressAction={() => {
                                if (!isSubmitDisabled) {
                                    handleFormSubmit();
                                }
                            }} 
                        />

                        <View className='flex flex-row gap-1 w-full justify-center items-center'>
                            <Link href='/sign-up'>
                                <Text className='text-primary font-spacemono-bold text-sm'>
                                    Back
                                </Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

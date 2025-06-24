import { View, TextInput, ScrollView } from 'react-native';
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
import PageLink from '@/components/ui/links/LoginPageLink';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

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
        isSubmitDisabled,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<SignUpStep2FormData>({
        schema: signUpStep2Schema,
        defaultValues: {
            firstName: signUpProps.first_name || '',
            lastName: signUpProps.last_name || '',
            size: signUpProps.sneaker_size ? String(signUpProps.sneaker_size) : '',
            profile_picture: signUpProps.profile_picture || '',
        },
        fieldNames: ['firstName', 'lastName', 'size'],
        enableClearError: false,
        onSubmit: async (data) => {
            const updatedSignUpProps = {
                ...signUpProps,
                first_name: data.firstName,
                last_name: data.lastName,
                sneaker_size: data.size ? Number(data.size) : 0,
                profile_picture: data.profile_picture,
            };
            
            setSignUpProps(updatedSignUpProps);
            
            const success = await signUp(updatedSignUpProps);
            if (success) {
                router.replace('/(auth)/(signup)/collection');
            }
        },
    });

    return (
        <KeyboardAwareScrollView 
            ref={scrollViewRef}
            className="flex-1 bg-background" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 8 }}
            bottomOffset={10}
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
                        label="First Name*"
                        placeholder="John"
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
                        label="Last Name*"
                        placeholder="Doe"
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
                        label="Sneaker Size (US)*"
                        placeholder="9.5"
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
                        backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                        onPressAction={() => {
                            if (!isSubmitDisabled) {
                                handleFormSubmit();
                            }
                        }}
                        isDisabled={isSubmitDisabled}
                    />

                    <PageLink href='/sign-up' linkText='Back' />
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}

import ErrorMsg from "@/components/ui/text/ErrorMsg";
import PageTitle from "@/components/ui/text/PageTitle";
import { ScrollView, View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRef } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import LoginPageLink from "@/components/ui/links/LoginPageLink";
import FormTextInput from "@/components/ui/inputs/FormTextInput";
import FormPasswordInput from "@/components/ui/inputs/FormPasswordInput";
import { useSignUpProps } from "@/context/signUpPropsContext";
import { useFormController } from "@/hooks/useFormController";
import { useAsyncValidation } from "@/hooks/useAsyncValidation";
import { useAuth } from "@/hooks/useAuth";
import { signUpStep1Schema, SignUpStep1FormData } from "@/validation/schemas";

export default function SignUpFirstForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const usernameInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const { signUpProps, setSignUpProps } = useSignUpProps();
    const { handleNextSignupPage } = useAuth();
    const { checkUsernameExists, checkEmailExists } = useAsyncValidation();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
        isSubmitDisabled,
    } = useFormController<SignUpStep1FormData>({
        schema: signUpStep1Schema,
        defaultValues: {
            username: signUpProps.username || '',
            email: signUpProps.email || '',
            password: signUpProps.password || '',
            confirmPassword: signUpProps.confirmPassword || '',
        },
        asyncValidation: {
            username: checkUsernameExists,
            email: checkEmailExists,
        },
        onSubmit: async (data) => {
            setSignUpProps({
                ...signUpProps,
                username: data.username,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            await handleNextSignupPage({
                ...signUpProps,
                username: data.username,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });
        },
    });

    const hasMultipleErrors = [
        hasFieldError('username'),
        hasFieldError('email'),
        hasFieldError('password'),
        hasFieldError('confirmPassword'),
    ].filter(Boolean).length > 1;

    const globalErrorMsg = hasMultipleErrors 
        ? 'Please correct the fields in red before continuing'
        : '';

    const displayedError = globalErrorMsg || 
        getFieldError('username') || 
        getFieldError('email') || 
        getFieldError('password') || 
        getFieldError('confirmPassword') || 
        '';

    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName as keyof SignUpStep1FormData);
    };

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
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 items-center p-4 gap-12">
                    <PageTitle content='Sign Up' />
                    <View className='flex justify-center items-center gap-8 w-full mt-10 px-12'>
                        <View className='w-full absolute' style={{ top: -50 }}>   
                            <ErrorMsg content={displayedError} display={displayedError !== ''} />
                        </View>

                        <FormTextInput
                            name="username"
                            control={control}
                            label="*Username"
                            placeholder="Username"
                            ref={usernameInputRef}
                            nextInputRef={emailInputRef}
                            autoComplete="username"
                            maxLength={16}
                            onFocus={() => handleFieldFocus('username')}
                            onBlur={async (value) => { await validateFieldOnBlur('username', value); }}
                            error={getFieldErrorWrapper('username')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <FormTextInput
                            name="email"
                            control={control}
                            label="*Email"
                            placeholder="Email"
                            ref={emailInputRef}
                            nextInputRef={passwordInputRef}
                            keyboardType="email-address"
                            autoComplete="email"
                            onFocus={() => handleFieldFocus('email')}
                            onBlur={async (value) => { await validateFieldOnBlur('email', value); }}
                            error={getFieldErrorWrapper('email')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <FormPasswordInput
                            name="password"
                            control={control}
                            label="*Password"
                            placeholder="Password"
                            ref={passwordInputRef}
                            nextInputRef={confirmPasswordInputRef}
                            onFocus={() => handleFieldFocus('password')}
                            onBlur={async (value) => { await validateFieldOnBlur('password', value); }}
                            error={getFieldErrorWrapper('password')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <FormPasswordInput
                            name="confirmPassword"
                            control={control}
                            label="*Confirm Password"
                            placeholder="Confirm Password"
                            ref={confirmPasswordInputRef}
                            onFocus={() => handleFieldFocus('confirmPassword')}
                            onBlur={async (value) => { await validateFieldOnBlur('confirmPassword', value); }}
                            onSubmitEditing={handleFormSubmit}
                            error={getFieldErrorWrapper('confirmPassword')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <View className='flex gap-5 w-full justify-center items-center'>
                            <MainButton 
                                content='Next' 
                                backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                                onPressAction={() => {
                                    if (!isSubmitDisabled) {
                                        handleFormSubmit();
                                    }
                                }}
                            />
                            <LoginPageLink />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

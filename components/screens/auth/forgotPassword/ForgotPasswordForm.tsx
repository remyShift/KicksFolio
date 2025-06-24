import { ScrollView, Platform, TextInput } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { View } from 'react-native'
import { useRef } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import { useAuth } from "@/hooks/useAuth";
import FormTextInput from "@/components/ui/inputs/FormTextInput";
import { useFormController } from "@/hooks/useFormController";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/validation/schemas";
import PageLink from "@/components/ui/links/LoginPageLink";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function ForgotPasswordForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);

    const { forgotPassword, errorMsg: authErrorMsg } = useAuth();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        isSubmitDisabled,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<ForgotPasswordFormData>({
        schema: forgotPasswordSchema,
        defaultValues: {
            email: '',
        },
        fieldNames: ['email'],
        authErrorMsg,
        onSubmit: async (data) => {
            await forgotPassword(data.email);
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
            <View className="flex-1 items-center p-4 gap-12">
                <PageTitle content='Forgot Password' />
                <View className='flex-1 justify-center items-center gap-8 w-full px-12'>
                    <View className='w-full'>   
                        <ErrorMsg content={displayedError} display={displayedError !== ''} />
                    </View>

                    <FormTextInput
                        name="email"
                        control={control}
                        label="Email*"
                        placeholder="john@doe.com"
                        ref={emailInputRef}
                        keyboardType="email-address"
                        autoComplete="email"
                        onFocus={() => handleFieldFocus('email')}
                        onBlur={async (value) => { await validateFieldOnBlur('email', value); }}
                        onSubmitEditing={handleFormSubmit}
                        error={getFieldErrorWrapper('email')}
                        getFieldError={getFieldErrorWrapper}
                    />

                    <View className='flex gap-3 w-full justify-center items-center'>
                        <MainButton 
                            content='Reset' 
                            backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                            onPressAction={() => {
                                if (!isSubmitDisabled) {
                                    handleFormSubmit();
                                }
                            }}
                            isDisabled={isSubmitDisabled}
                        />
                        <PageLink href='/login' linkText='Back to Login' />
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}

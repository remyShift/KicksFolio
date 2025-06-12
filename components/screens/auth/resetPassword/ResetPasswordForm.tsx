import { ScrollView, KeyboardAvoidingView, Platform, TextInput, View } from "react-native";
import PageTitle from "@/components/ui/text/PageTitle"
import ErrorMsg from "@/components/ui/text/ErrorMsg"
import MainButton from "@/components/ui/buttons/MainButton"
import { useRef } from "react"
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import FormPasswordInput from "@/components/ui/inputs/FormPasswordInput";
import { useFormController } from "@/hooks/useFormController";
import { resetPasswordSchema, ResetPasswordFormData } from "@/validation/schemas";

export default function ResetPasswordForm() {
    const { token } = useLocalSearchParams();
    const scrollViewRef = useRef<ScrollView>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    
    const { resetPassword, errorMsg: authErrorMsg, clearError } = useAuth();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
        isSubmitDisabled,
    } = useFormController<ResetPasswordFormData>({
        schema: resetPasswordSchema,
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        onSubmit: async (data) => {
            await resetPassword(token as string, data.password, data.confirmPassword);
        },
    });

    const handleFieldFocusWithClearError = (fieldName: keyof ResetPasswordFormData) => {
        handleFieldFocus(fieldName);
        clearError();
    };

    const hasMultipleErrors = [
        hasFieldError('password'),
        hasFieldError('confirmPassword'),
    ].filter(Boolean).length > 1;

    const globalErrorMsg = hasMultipleErrors 
        ? 'Please correct the fields in red before continuing'
        : '';

    const displayedError = globalErrorMsg || 
        getFieldError('password') || 
        getFieldError('confirmPassword') || 
        authErrorMsg || 
        '';

    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName as keyof ResetPasswordFormData);
    };

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 items-center p-4 gap-12">
                    <PageTitle content='Reset Password' />
                    <View className='flex-1 justify-center items-center gap-8 w-full px-12'>
                        <View className='w-full absolute' style={{ top: 100 }}>   
                            <ErrorMsg content={displayedError} display={displayedError !== ''} />
                        </View>

                        <FormPasswordInput
                            name="password"
                            control={control}
                            label="*New Password"
                            placeholder="New Password"
                            ref={passwordInputRef}
                            nextInputRef={confirmPasswordInputRef}
                            onFocus={() => handleFieldFocusWithClearError('password')}
                            onBlur={async (value) => { await validateFieldOnBlur('password', value); }}
                            error={getFieldErrorWrapper('password')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <FormPasswordInput
                            name="confirmPassword"
                            control={control}
                            label="*Confirm New Password"
                            placeholder="Confirm New Password"
                            ref={confirmPasswordInputRef}
                            onFocus={() => handleFieldFocusWithClearError('confirmPassword')}
                            onBlur={async (value) => { await validateFieldOnBlur('confirmPassword', value); }}
                            onSubmitEditing={handleFormSubmit}
                            error={getFieldErrorWrapper('confirmPassword')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <View className='flex gap-5 w-full justify-center items-center'>
                            <MainButton 
                                content='Reset' 
                                backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                                onPressAction={() => {
                                    if (!isSubmitDisabled) {
                                        handleFormSubmit();
                                    }
                                }}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

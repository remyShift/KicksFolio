import { ScrollView, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { View } from 'react-native'
import { useRef } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import FormTextInput from "@/components/ui/inputs/FormTextInput";
import { useFormController } from "@/hooks/useFormController";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/validation/schemas";

export default function ForgotPasswordForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);

    const { forgotPassword, errorMsg: authErrorMsg } = useAuth();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        getFieldError,
        hasFieldError,
        isSubmitDisabled,
    } = useFormController<ForgotPasswordFormData>({
        schema: forgotPasswordSchema,
        defaultValues: {
            email: '',
        },
        onSubmit: async (data) => {
            await forgotPassword(data.email);
        },
    });

    const hasMultipleErrors = [
        hasFieldError('email'),
    ].filter(Boolean).length > 1;

    const globalErrorMsg = hasMultipleErrors 
        ? 'Please correct the fields in red before continuing'
        : '';

    const displayedError = globalErrorMsg || 
        getFieldError('email') || 
        authErrorMsg || 
        '';

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
                    <PageTitle content='Forgot Password' />
                    <View className='flex justify-center items-center gap-8 w-full mt-10'>
                        <View className='w-full absolute' style={{ top: -50 }}>   
                            <ErrorMsg content={displayedError} display={displayedError !== ''} />
                        </View>

                        <FormTextInput
                            name="email"
                            control={control}
                            label="*Email"
                            placeholder="Email"
                            ref={emailInputRef}
                            keyboardType="email-address"
                            autoComplete="email"
                            onFocus={() => handleFieldFocus('email')}
                            onSubmitEditing={handleFormSubmit}
                            error={getFieldError('email')}
                        />

                        <View className='flex gap-5 w-full justify-center items-center'>
                            <MainButton 
                                content='Reset Password' 
                                backgroundColor={isSubmitDisabled ? 'bg-gray-600' : 'bg-primary'}
                                onPressAction={() => {
                                    if (!isSubmitDisabled) {
                                        handleFormSubmit();
                                    }
                                }}
                            />
                            <Link href="/login" className="text-primary">
                                Back to Login
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

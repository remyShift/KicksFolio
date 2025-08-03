import { ScrollView, TextInput } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { View } from 'react-native'
import { useRef } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import { useAuth } from "@/hooks/useAuth";
import FormTextInput from "@/components/ui/inputs/FormTextInput";
import { useFormController } from "@/hooks/useFormController";
import { createForgotPasswordSchema, ForgotPasswordFormData } from "@/validation/schemas";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTranslation } from 'react-i18next';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import useToast from "@/hooks/ui/useToast";
import { RelativePathString } from "expo-router";
import AuthHeader from "../AuthHeader";

export default function ForgotPasswordForm() {
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);
    const { showErrorToast } = useToast();

    const { forgotPassword, errorMsg: authErrorMsg } = useAuth();
    const { checkEmailExistsForReset } = useAuthValidation();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        isSubmitDisabled,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<ForgotPasswordFormData>({
        schema: createForgotPasswordSchema(),
        defaultValues: {
            email: '',
        },
        fieldNames: ['email'],
        authErrorMsg,
        asyncValidation: {
            email: checkEmailExistsForReset,
        },
        onSubmit: async (data) => {
            forgotPassword(data.email)
            .catch((error) => {
                showErrorToast(
                    t('auth.error.forgotPassword'), 
                    error.message
                );
            });
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
            <View className="flex-1 items-center p-4 gap-12 mt-20">
                <AuthHeader page={{
                    title: t('auth.titles.forgotPassword'),
                    routerBack: '/(auth)/login' as RelativePathString,
                }} />
                <View className='flex-1 justify-center items-center gap-8 w-full px-12'>
                    <View className='w-full'>   
                        <ErrorMsg content={displayedError} display={displayedError !== ''} />
                    </View>

                    <FormTextInput
                        name="email"
                        control={control}
                        label={t('auth.form.email.label')}
                        placeholder={t('auth.form.email.placeholder')}
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
                            content={t('auth.buttons.forgotPassword')} 
                            backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                            onPressAction={() => {
                                if (!isSubmitDisabled) {
                                    handleFormSubmit();
                                }
                            }}
                            isDisabled={isSubmitDisabled}
                        />
                    </View>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}

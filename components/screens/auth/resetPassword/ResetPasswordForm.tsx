import { ScrollView, TextInput, View } from "react-native";
import PageTitle from "@/components/ui/text/PageTitle"
import ErrorMsg from "@/components/ui/text/ErrorMsg"
import MainButton from "@/components/ui/buttons/MainButton"
import { useRef } from "react"
import { useAuth } from "@/hooks/useAuth";
import FormPasswordInput from "@/components/ui/inputs/FormPasswordInput";
import { useFormController } from "@/hooks/useFormController";
import { createResetPasswordSchema, ResetPasswordFormData } from "@/validation/schemas";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTranslation } from 'react-i18next';
import useToast from "@/hooks/useToast";
import { useSession } from "@/context/authContext";

export default function ResetPasswordForm() {
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    
    const { resetPassword, errorMsg: authErrorMsg } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    const { resetTokens } = useSession();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        isSubmitDisabled,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<ResetPasswordFormData>({
        schema: createResetPasswordSchema(),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        fieldNames: ['password', 'confirmPassword'],
        authErrorMsg,
        onSubmit: async (data) => {
            resetPassword(data.password, data.confirmPassword)
            .then(() => {
                showSuccessToast(
                    t('auth.resetPassword.success'), 
                    t('auth.resetPassword.loginWithNewPassword')
                );
            })
            .catch((error) => {
                showErrorToast(
                    t('auth.error.resetPassword'), 
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
            <View className="flex-1 items-center p-4 gap-12">
                <PageTitle content={t('auth.titles.resetPassword')} />
                <View className='flex-1 justify-center items-center gap-8 w-full px-12'>
                    <ErrorMsg content={displayedError} display={displayedError !== ''} />
                    <FormPasswordInput
                        name="password"
                        control={control}
                        label={t('auth.form.password.label')}
                        description={t('auth.form.password.description')}
                        placeholder={t('auth.form.password.placeholder')}
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
                        label={t('auth.form.confirmPassword.label')}
                        placeholder={t('auth.form.password.placeholder')}
                        ref={confirmPasswordInputRef}
                        onFocus={() => handleFieldFocus('confirmPassword')}
                        onBlur={async (value) => { await validateFieldOnBlur('confirmPassword', value); }}
                        onSubmitEditing={handleFormSubmit}
                        error={getFieldErrorWrapper('confirmPassword')}
                        getFieldError={getFieldErrorWrapper}
                    />

                    <View className='flex gap-5 w-full justify-center items-center'>
                        <MainButton 
                            content={t('auth.buttons.resetPassword')} 
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

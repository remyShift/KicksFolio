import { ScrollView, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import PageTitle from '@/components/ui/text/PageTitle';
import { View, Text } from 'react-native'
import { useRef } from "react";
import MainButton from "@/components/ui/buttons/MainButton";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import FormTextInput from "@/components/ui/inputs/FormTextInput";
import FormPasswordInput from "@/components/ui/inputs/FormPasswordInput";
import { useFormController } from "@/hooks/useFormController";
import { loginSchema, LoginFormData } from "@/validation/schemas";

export default function LoginForm() {
    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const { login, errorMsg: authErrorMsg } = useAuth();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        getFieldError,
        hasFieldError,
        isSubmitDisabled,
    } = useFormController<LoginFormData>({
        schema: loginSchema,
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: async (data) => {
            await login(data.email, data.password);
        },
    });

    const hasMultipleErrors = [
        hasFieldError('email'),
        hasFieldError('password'),
    ].filter(Boolean).length > 1;

    const globalErrorMsg = hasMultipleErrors 
        ? 'Please correct the fields in red before continuing'
        : '';

    const displayedError = globalErrorMsg || 
        getFieldError('email') || 
        getFieldError('password') || 
        authErrorMsg || 
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
                    <PageTitle content='Login' />
                    <View className='flex justify-center items-center gap-8 w-full mt-36'>
                        <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                            <ErrorMsg content={displayedError} display={displayedError !== ''} />
                        </View>

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
                            error={getFieldError('email')}
                        />
                        
                        <FormPasswordInput
                            name="password"
                            control={control}
                            label="*Password"
                            placeholder="Password"
                            ref={passwordInputRef}
                            onFocus={() => handleFieldFocus('password')}
                            onSubmitEditing={handleFormSubmit}
                            error={getFieldError('password')}
                        />
                    </View>

                    <View className='flex gap-5 w-full justify-center items-center'>                      
                        <MainButton 
                            content='Login' 
                            backgroundColor={isSubmitDisabled ? 'bg-gray-600' : 'bg-primary'}
                            onPressAction={() => {
                                if (!isSubmitDisabled) {
                                    handleFormSubmit();
                                }
                            }}
                        />
                        <View className='flex gap-1 justify-center items-center'>
                            <View className='flex flex-row gap-1 justify-center items-center'>
                                <Text className='font-spacemono-bold text-sm'>Don't have an account?</Text>
                                <Link href='/sign-up'>
                                    <Text className='text-primary font-spacemono-bold text-sm'>
                                        Sign Up
                                    </Text>
                                </Link>
                            </View>
                            <Link href='/forgot-password'>
                                <Text className='text-primary font-spacemono-bold text-sm'>
                                    Forgot Password?
                                </Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

import { useState } from 'react';
import { AuthService } from '@/services/AuthService';
import { FormValidationService } from '@/services/FormValidationService';
import { router } from 'expo-router';
import { UserData } from '@/types/Auth';

export const useAuth = () => {
    const [errorMsg, setErrorMsg] = useState('');
    const authService = new AuthService();
    const formValidation = new FormValidationService(setErrorMsg, {});

    const login = async (email: string, password: string) => {
        const success = await authService.handleLogin(email, password, formValidation);
        if (success) {
            router.replace('/');
        }
    };

    const signUp = async (userData: UserData, setSignUpProps: (props: any) => void) => {
        const success = await authService.handleSignUp(userData, formValidation, setSignUpProps);
        if (success) {
            router.replace('/collection');
        }
    };

    const forgotPassword = async (email: string) => {
        const success = await authService.handleForgotPassword(email, formValidation);
        if (success) {
            router.replace('/login');
        }
    };

    const resetPassword = async (token: string, newPassword: string, confirmNewPassword: string) => {
        const success = await authService.handleResetPassword(
            token,
            newPassword,
            confirmNewPassword,
            formValidation
        );
        if (success) {
            router.replace('/login');
        }
    };

    return {
        errorMsg,
        login,
        signUp,
        forgotPassword,
        resetPassword,
        formValidation
    };
}; 
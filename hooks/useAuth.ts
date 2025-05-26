import { useState } from 'react';
import { AuthService } from '@/services/AuthService';
import { FormValidationService } from '@/services/FormValidationService';
import { router } from 'expo-router';
import { UserData } from '@/types/Auth';
import { User } from '@/types/User';

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

    const logout = async (token: string) => {
        return authService.logout(token)
            .then((ok) => {
                if (ok) {
                    router.replace('/login');
                }
                return ok;
            })
            .catch(() => {
                setErrorMsg('Erreur lors de la déconnexion.');
                return false;
            });
    };

    const verifyToken = async (token: string) => {
        return authService.verifyToken(token)
            .then((isValid) => isValid)
            .catch(() => {
                setErrorMsg('Erreur lors de la vérification du token.');
                return false;
            });
    };

    const updateUser = async (userId: string, profileData: Partial<UserData>, token: string) => {
        return authService.updateUser(userId, profileData, token)
            .then((data) => {
                router.replace('/(app)/(tabs)/user');
                return data;
            })
            .catch(() => {
                setErrorMsg('Erreur lors de la mise à jour du profil.');
                return null;
            });
    };

    const deleteAccount = async (userId: string, token: string) => {
        return authService.deleteAccount(userId, token)
            .then((data) => {
                router.replace('/login');
                return data;
            })
            .catch(() => {
                setErrorMsg('Erreur lors de la suppression du compte.');
                return null;
            });
    };

    const getUser = async (token: string) => {
        return authService.getUser(token)
            .then((data) => data)
            .catch(() => {
                setErrorMsg('Erreur lors de la récupération du profil utilisateur.');
                return null;
            });
    };

    return {
        errorMsg,
        login,
        signUp,
        forgotPassword,
        resetPassword,
        logout,
        verifyToken,
        updateUser,
        deleteAccount,
        getUser,
        formValidation
    };
}; 
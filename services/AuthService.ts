import { BaseApiService } from "@/services/BaseApiService";
import { User } from "@/types/User";
import { FormValidationService } from "./FormValidationService";
import { UserData } from "@/types/Auth";

interface LoginResponse {
    user: User;
    tokens: {
        access: string;
        refresh: string;
    };
}

export class AuthService extends BaseApiService {
    async handleLogin(
        email: string, 
        password: string, 
        formValidationService: FormValidationService
    ): Promise<boolean> {
        const isEmailValid = await formValidationService.validateField(email, 'email', undefined);
        const isPasswordValid = formValidationService.validateField(password, 'password');

        if (!isEmailValid || !isPasswordValid) {
            return false;
        }

        return this.login(email, password)
            .then(() => {
                return true;
            })
            .catch(() => {
                formValidationService.setErrorMessage('Invalid email or password');
                return false;
            });
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            },
            body: JSON.stringify({ authentication: { email, password } })
        });
        
        return this.handleResponse(response);
    }

    async getUser(token: string): Promise<{ user: User }> {
        const response = await fetch(`${this.baseUrl}/users/me`, {
            headers: this.getAuthHeaders(token)
        });
        
        return this.handleResponse(response);
    }

    async signUp(
        userData: UserData
    ): Promise<{ user: User }> {
        const formData = new FormData();
        
        formData.append('user[email]', userData.email);
        formData.append('user[password]', userData.password);
        formData.append('user[username]', userData.username);
        formData.append('user[first_name]', userData.first_name);
        formData.append('user[last_name]', userData.last_name);
        formData.append('user[sneaker_size]', userData.sneaker_size.toString());

        if (userData.profile_picture) {
            const imageUriParts = userData.profile_picture.split('.');
            const fileType = imageUriParts[imageUriParts.length - 1];
            
            formData.append('user[profile_picture]', {
                uri: userData.profile_picture,
                type: 'image/jpeg',
                name: `profile_picture.${fileType}`
            } as any);
        }

        const response = await fetch(`${this.baseUrl}/users`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: formData
        });

        return this.handleResponse(response);
    }

    async logout(token: string) {
        const response = await fetch(`${this.baseUrl}/logout`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token)
        });
        
        return response.ok;
    }

    async verifyToken(token: string) {
        const response = await fetch(`${this.baseUrl}/verify_token`, {
            method: 'POST',
            headers: this.getAuthHeaders(token)
        });

        if (!response.ok) return false;
        const data = await response.json();
        return data.valid;
    }

    async updateUser(userId: string, profileData: Partial<UserData>, token: string): Promise<{ user: User }> {
        const formData = new FormData();
        
        Object.entries(profileData).forEach(([key, value]) => {
            if (key !== 'profile_picture' && value) {
                formData.append(`user[${key.replace('new', '').toLowerCase()}]`, value.toString());
            }
        });

        if (profileData.profile_picture) {
            const imageUriParts = profileData.profile_picture.split('.');
            const fileType = imageUriParts[imageUriParts.length - 1];
            
            formData.append('user[profile_picture]', {
                uri: profileData.profile_picture,
                type: 'image/jpeg',
                name: `profile_picture.${fileType}`
            } as any);
        }

        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(token),
            body: formData
        });

        return this.handleResponse(response);
    }

    async handleResetPassword(
        token: string,
        newPassword: string,
        confirmPassword: string,
        formValidationService: FormValidationService
    ): Promise<boolean> {
        const isPasswordValid = formValidationService.validateField(newPassword, 'password');
        const isConfirmPasswordValid = formValidationService.validateField(confirmPassword, 'confirmPassword');

        if (!isPasswordValid || !isConfirmPasswordValid) {
            return false;
        }

        return this.resetPassword(token, newPassword)
            .then(() => true)
            .catch(() => {
                formValidationService.setErrorMessage('An error occurred while resetting your password, please try again.');
                return false;
            });
    }

    private async resetPassword(token: string, newPassword: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/password/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                password: newPassword
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
    }

    async deleteAccount(userId: string, token: string): Promise<{ message: string }> {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token)
        });

        return this.handleResponse(response);
    }

    async handleForgotPassword(
        email: string,
        formValidationService: FormValidationService
    ): Promise<boolean> {
        const isEmailValid = await formValidationService.validateField(email, 'email');

        if (!isEmailValid) {
            return false;
        }

        return this.forgotPassword(email)
            .then(() => true)
            .catch(() => {
                formValidationService.setErrorMessage('An error occurred while sending the reset email, please try again.');
                return false;
            });
    }

    private async forgotPassword(email: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/passwords/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
    }

    async handleSignUp(
        userData: UserData,
        formValidationService: FormValidationService,
        setSignUpProps: (props: any) => void,
    ): Promise<boolean> {
        if (!userData.username.trim()) {
            formValidationService.setErrorMessage('Please put your username.');
            return false;
        }

        if (!userData.first_name.trim()) {
            formValidationService.setErrorMessage('Please put your first name.');
            return false;
        }

        if (!userData.last_name.trim()) {
            formValidationService.setErrorMessage('Please put your last name.');
            return false;
        }

        if (!userData.sneaker_size || userData.sneaker_size <= 0) {
            formValidationService.setErrorMessage('Please put a valid sneaker size.');
            return false;
        }

        return this.signUp(userData)
        .then(() => {
            return this.login(userData.email, userData.password);
        })
        .then(() => {
            setSignUpProps({ ...userData, email: '', password: '', username: '', first_name: '', last_name: '', sneaker_size: '', profile_picture: '' });
            return true;
        })
        .catch((error) => {
            formValidationService.setErrorMessage(`Something went wrong. Please try again. ${error}`);
            return false;
        });
    }
}

export const authService = new AuthService(); 
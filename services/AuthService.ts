import { BaseApiService } from "@/services/BaseApiService";

interface UserData {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
    sneaker_size: number;
    profile_picture?: string;
}

interface LoginResponse {
    user: UserData;
    tokens: {
        access: string;
        refresh: string;
    };
}

export class AuthService extends BaseApiService {
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

    async getUser(token: string) {
        const response = await fetch(`${this.baseUrl}/users/me`, {
            headers: this.getAuthHeaders(token)
        });
        
        return this.handleResponse(response);
    }

    async signUp(userData: UserData) {
        const formData = new FormData();
        
        Object.entries(userData).forEach(([key, value]) => {
            if (key !== 'profile_picture') {
                formData.append(`user[${key}]`, value.toString());
            }
        });

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

    async updateUser(userId: string, profileData: Partial<UserData>, token: string) {
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

    async deleteAccount(userId: string, token: string) {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token)
        });

        return this.handleResponse(response);
    }
}

export const authService = new AuthService(); 
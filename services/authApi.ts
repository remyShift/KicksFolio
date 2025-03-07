const BASE_URL = process.env.EXPO_PUBLIC_BASE_API_URL;

export const authApi = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authentication: { email, password } })
        });
        
        if (!response.ok) throw new Error('Error logging in');
        return response.json();
    },

    getUser: async (token: string) => {
        const response = await fetch(`${BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error when getting user');
        return response.json();
    },

    signUp: async (userData: {
        email: string,
        password: string,
        username: string,
        first_name: string,
        last_name: string,
        sneaker_size: number,
        profile_picture: string
    }) => {
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
            
            const imageFile = {
                uri: userData.profile_picture,
                type: 'image/jpeg',
                name: `profile_picture.${fileType}`
            };

            formData.append('user[profile_picture]', imageFile as any);
        }

        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData,
        });

        const text = await response.text();
        const data = JSON.parse(text);
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Error when creating account');
        }

        return data;
    },

    logout: async (token: string) => {
        const response = await fetch(`${BASE_URL}/logout`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.ok;
    },

    verifyToken: async (token: string) => {
        const response = await fetch(`${BASE_URL}/verify_token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) return false;
        const data = await response.json();
        return data.valid;
    },

    getUserCollection: async (userId: string, token: string) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/collection`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized');
            throw new Error('Error when getting collection');
        }

        return response.json();
    },

    getUserSneakers: async (userId: string, token: string) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/collection/sneakers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return null;
        return response.json();
    },

    updateUser: async (userId: string, profileData: any, token: string) => {
        const formData = new FormData();
        
        if (profileData.newUsername) {
            formData.append('user[username]', profileData.newUsername);
        }
        if (profileData.newFirstName) {
            formData.append('user[first_name]', profileData.newFirstName);
        }
        if (profileData.newLastName) {
            formData.append('user[last_name]', profileData.newLastName);
        }
        if (profileData.newSneakerSize) {
            formData.append('user[sneaker_size]', profileData.newSneakerSize.toString());
        }
    
        if (profileData.newProfilePicture) {
            const imageUriParts = profileData.newProfilePicture.split('.');
            const fileType = imageUriParts[imageUriParts.length - 1];
            
            const imageFile = {
                uri: profileData.newProfilePicture,
                type: 'image/jpeg',
                name: `profile_picture.${fileType}`
            };
    
            formData.append('user[profile_picture]', imageFile as any);
        }

        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const text = await response.text();
        const data = JSON.parse(text);
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Error when updating profile');
        }

        return data;
    },

    deleteAccount: async (userId: string, token: string) => {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error when deleting account');
        }

        return response.json();
    }
};
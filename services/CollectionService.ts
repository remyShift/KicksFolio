import { BaseApiService } from "@/services/BaseApiService";

export class CollectionService extends BaseApiService {
    async create(name: string, userId: string, sessionToken: string) {
        const response = await fetch(`${this.baseUrl}/users/${userId}/collection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(sessionToken)
            },
            body: JSON.stringify({ collection: { name } })
        });

        return this.handleResponse(response);
    }

    async getUserCollection(userId: string, token: string) {
        const response = await fetch(`${this.baseUrl}/users/${userId}/collection`, {
            headers: this.getAuthHeaders(token)
        });

        return this.handleResponse(response);
    }
}

export const collectionService = new CollectionService();

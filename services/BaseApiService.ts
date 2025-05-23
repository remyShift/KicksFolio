export class BaseApiService {
    protected baseUrl: string;

    constructor() {
        this.baseUrl = process.env.EXPO_PUBLIC_BASE_API_URL || '';
    }

    protected async handleResponse(response: Response) {
        try {
            const contentType = response.headers?.get('content-type');
            if (contentType?.includes('application/json')) {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.errors ? data.errors.join(', ') : data.message || data.error || 'API Error');
                }
                return data;
            }
            
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || 'API Error');
            }
            
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('API Error');
        }
    }

    protected getAuthHeaders(token?: string) {
        const headers: Record<string, string> = {
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
}
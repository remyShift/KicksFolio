import { FormValidationService } from '@/services/FormValidationService';

const mockSetErrorMsg = jest.fn();
const mockSetError = jest.fn();

describe('Checking user inputs', () => {
    const validationService = new FormValidationService(mockSetErrorMsg, mockSetError);

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    describe('Check email input', () => {
        it('should return true if the email is valid', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ users: [] })
            });

            const result = await validationService.validateField('test@example.com', 'email', false);
            
            expect(result).toBe(true);
            expect(mockSetErrorMsg).toHaveBeenCalledWith('');
            expect(mockSetError).toHaveBeenCalledWith(false);
        });

        it('should return false if the email is invalid', async () => {
            const result = await validationService.validateField('invalid-email', 'email', false);
            
            expect(result).toBe(false);
        });

        it('should return false if the email already exists', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ email: 'test@example.com' }] 
                })
            });

            const result = await validationService.validateField('test@example.com', 'email', false);
            
            expect(result).toBe(false);
        });

        it('should return false if the email is not provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ email: '' }] 
                })
            });

            const result = await validationService.validateField('', 'email', false);
            expect(result).toBe(false);
        });
    });

    describe('Check password input', () => {
        it('should return true if the password is valid', async () => {
            const result = await validationService.validateField('Password123', 'password', false);
            expect(result).toBe(true);
        });

        it('should return false if the password is too short (less than 8 characters)', async () => {
            const result = await validationService.validateField('Pass1', 'password', false);
            expect(result).toBe(false);
        });

        it('should return false if the password does not contain at least one uppercase letter', async () => {
            const result = await validationService.validateField('password123', 'password', false);
            expect(result).toBe(false);
        });

        it('should return false if the password does not contain at least one number', async () => {
            const result = await validationService.validateField('Password', 'password', false);
            expect(result).toBe(false);
        });

        it('should return false if the password is not provided', async () => {
            const result = await validationService.validateField('', 'password', false);
            expect(result).toBe(false);
        });
    });

    describe('Check confirm password input', () => {
        it('should return true if the confirm password is the same as the password', async () => {
            const result = await validationService.validateField('Password123', 'confirmPassword', false, null, 'Password123');
            expect(result).toBe(true);
        });

        it('should return false if the confirm password is not the same as the password', async () => {
            const result = await validationService.validateField('Password123', 'confirmPassword', false, null, 'DifferentPassword');
            expect(result).toBe(false);
        });

        it('should return false if the confirm password is not provided', async () => {
            const result = await validationService.validateField('', 'confirmPassword', false, null, 'Password123');
            expect(result).toBe(false);
        });

        it('should throw an error if password is not provided', async () => {
            await expect(validationService.validateField('Password123', 'confirmPassword', false, null))
                .rejects
                .toThrow('Password is required');
        });
    });

    describe('Check size input', () => {
        it('should return true if the size is valid (between 1 and 15)', async () => {
            const result = await validationService.validateField('9', 'size', false);
            expect(result).toBe(true);
        });

        it('should return false if the size is invalid (not between 1 and 15)', async () => {
            const result = await validationService.validateField('16', 'size', false);
            expect(result).toBe(false);
        });

        it('should return false if the size is invalid (not a multiple of 0.5)', async () => {
            const result = await validationService.validateField('1.6', 'size', false);
            expect(result).toBe(false);
        });

        it('should return false if the size is not provided', async () => {
            const result = await validationService.validateField('0', 'size', false);
            expect(result).toBe(false);
        });
    });

    describe('Check username input', () => {
        it('should return true if the username is valid', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ users: [] })
            });

            const result = await validationService.validateField('JohnDoe', 'username', false);
            
            expect(result).toBe(true);
        });

        it('should return false if the username is too short (less than 4 characters)', async () => {
            const result = await validationService.validateField('jo', 'username', false);
            
            expect(result).toBe(false);
        });

        it('should return false if the username is too long (more than 16 characters)', async () => {
            const result = await validationService.validateField('JohnDoe1234567890123456', 'username', false);
            
            expect(result).toBe(false);
        });

        it('should return false if the username already exists', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ username: 'JohnDoe' }] 
                })
            });

            const result = await validationService.validateField('JohnDoe', 'username', false);
            
            expect(result).toBe(false);
        });

        it('should return false if the username is not provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ username: '' }] 
                })
            });

            const result = await validationService.validateField('', 'username', false);
            expect(result).toBe(false);
        });
    });

    describe('Check name input', () => {
        it('should return true if the name is valid', async () => {
            const result = await validationService.validateField('John Doe', 'firstName', false);
            expect(result).toBe(true);
        });

        it('should return false if the name is not provided', async () => {
            const result = await validationService.validateField('', 'firstName', false);
            expect(result).toBe(false);
        });

        it('should return false if the name is too short (less than 2 characters)', async () => {
            const result = await validationService.validateField('J', 'firstName', false);
            expect(result).toBe(false);
        });

        it('should return false if the name contains special characters or numbers', async () => {
            const result = await validationService.validateField('John2', 'firstName', false);
            expect(result).toBe(false);
        });
    });
});


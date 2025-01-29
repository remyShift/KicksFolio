import { checkConfirmPassword, checkEmail, checkName, checkPassword, checkSize, checkUsername } from '../../scripts/formUtils';

const mockSetErrorMsg = jest.fn();
const mockSetError = jest.fn();

describe('Checking user inputs', () => {
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

            const result = await checkEmail('test@example.com', false, mockSetErrorMsg, mockSetError);
            
            expect(result).toBe(true);
            expect(mockSetErrorMsg).toHaveBeenCalledWith('');
            expect(mockSetError).toHaveBeenCalledWith(false);
        });

        it('should return false if the email is invalid', async () => {
            const result = await checkEmail('invalid-email', false, mockSetErrorMsg, mockSetError);
            
            expect(result).toBe(false);
        });

        it('should return false if the email already exists', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ email: 'test@example.com' }] 
                })
            });

            const result = await checkEmail('test@example.com', false, mockSetErrorMsg, mockSetError);
            
            expect(result).toBe(false);
        });

        it('should return false if the email is not provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ email: '' }] 
                })
            });

            const result = await checkEmail('', false, mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });
    });

    describe('Check password input', () => {
        it('should return true if the password is valid', () => {
            const result = checkPassword('Password123', mockSetErrorMsg, mockSetError);
            expect(result).toBe(true);
        });

        it('should return false if the password is too short (less than 8 characters)', () => {
            const result = checkPassword('Pass1', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the password does not contain at least one uppercase letter', () => {
            const result = checkPassword('password123', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the password does not contain at least one number', () => {
            const result = checkPassword('Password', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the password is not provided', () => {
            const result = checkPassword('', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });
    });

    describe('Check confirm password input', () => {
        it('should return true if the confirm password is the same as the password', () => {
            const result = checkConfirmPassword('Password123', 'Password123', mockSetErrorMsg, mockSetError);
            expect(result).toBe(true);
        });

        it('should return false if the confirm password is not the same as the password', () => {
            const result = checkConfirmPassword('Password123', 'Password1234', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the confirm password is not provided', () => {
            const result = checkConfirmPassword('', 'Password123', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });
    });

    describe('Check size input', () => {
        it('should return true if the size is valid (between 1 and 15)', () => {
            const result = checkSize(9, mockSetErrorMsg, mockSetError);
            expect(result).toBe(true);
        });

        it('should return false if the size is invalid (not between 1 and 15)', () => {
            const result = checkSize(16, mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the size is invalid (not a multiple of 0.5)', () => {
            const result = checkSize(1.6, mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the size is not provided', () => {
            const result = checkSize(0, mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });
    });

    describe('Check username input', () => {
        it('should return true if the username is valid', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ users: [] })
            });

            const result = await checkUsername('JohnDoe', mockSetErrorMsg, mockSetError);
            
            expect(result).toBe(true);
        });

        it('should return false if the username is too short (less than 4 characters)', async () => {
            const result = await checkUsername('jo', mockSetErrorMsg, mockSetError);
            
            expect(result).toBe(false);
        });

        it('should return false if the username is too long (more than 16 characters)', async () => {
            const result = await checkUsername('JohnDoe1234567890123456', mockSetErrorMsg, mockSetError);
            
            expect(result).toBe(false);
        });

        it('should return false if the username already exists', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ username: 'JohnDoe' }] 
                })
            });

            const result = await checkUsername('JohnDoe', mockSetErrorMsg, mockSetError);
            
            expect(result).toBe(false);
        });

        it('should return false if the username is not provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    users: [{ username: '' }] 
                })
            });

            const result = await checkUsername('', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });
    });

    describe('Check name input', () => {
        it('should return true if the name is valid', () => {
            const result = checkName('John Doe', mockSetErrorMsg, mockSetError);
            expect(result).toBe(true);
        });

        it('should return false if the name is not provided', () => {
            const result = checkName('', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the name is too short (less than 2 characters)', () => {
            const result = checkName('J', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });

        it('should return false if the name contains special characters or numbers', () => {
            const result = checkName('John2', mockSetErrorMsg, mockSetError);
            expect(result).toBe(false);
        });
    });
});


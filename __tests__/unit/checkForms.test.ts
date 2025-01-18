import { checkEmail, checkPassword, checkUsername } from '../../scripts/formUtils';

describe('Validation des formulaires d\'authentification', () => {
    const mockSetErrorMsg = jest.fn();
    const mockSetError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('checkEmail', () => {
        it('devrait valider un email correct', async () => {
        const result = await checkEmail('test@example.com', false, mockSetErrorMsg, mockSetError);
        expect(result).toBe(true);
        expect(mockSetErrorMsg).not.toHaveBeenCalled();
        expect(mockSetError).not.toHaveBeenCalled();
        });

        it('devrait rejeter un email invalide', async () => {
        const result = await checkEmail('invalid-email', false, mockSetErrorMsg, mockSetError);
        expect(result).toBe(false);
        expect(mockSetErrorMsg).toHaveBeenCalledWith('Veuillez entrer un email valide.');
        expect(mockSetError).toHaveBeenCalledWith(true);
        });
    });

    describe('checkPassword', () => {
        it('devrait valider un mot de passe correct', () => {
        const result = checkPassword('Password123', mockSetErrorMsg, mockSetError);
        expect(result).toBe(true);
        expect(mockSetErrorMsg).not.toHaveBeenCalled();
        expect(mockSetError).not.toHaveBeenCalled();
        });

        it('devrait rejeter un mot de passe faible', () => {
        const result = checkPassword('weak', mockSetErrorMsg, mockSetError);
        expect(result).toBe(false);
        expect(mockSetErrorMsg).toHaveBeenCalled();
        expect(mockSetError).toHaveBeenCalledWith(true);
        });
    });
}); 
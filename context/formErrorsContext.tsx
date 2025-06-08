import { createContext, useContext, type PropsWithChildren } from 'react';

interface FormErrorsContextType {
    clearErrors: () => void;
}

const FormErrorsContext = createContext<FormErrorsContextType>({
    clearErrors: () => {}
});

export function useFormErrors() {
    return useContext(FormErrorsContext);
}

export function FormErrorsProvider({ 
    children, 
    clearErrors 
}: PropsWithChildren<{ clearErrors: () => void }>) {
    return (
        <FormErrorsContext.Provider value={{ clearErrors }}>
            {children}
        </FormErrorsContext.Provider>
    );
} 
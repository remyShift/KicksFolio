import { createContext, useContext, type PropsWithChildren, useState } from 'react';
import { UserData } from '@/types/Auth';

const SignUpPropsContext = createContext<{
    signUpProps: UserData
    setSignUpProps: (signUpProps: UserData) => void
}>({
    signUpProps: {
        email: '',
        password: '',
        username: '',
        first_name: '',
        last_name: '',
        sneaker_size: 0,
        profile_picture: '',
        confirmPassword: ''
    },
    setSignUpProps: () => {},
});

export function useSignUpProps() {
    const value = useContext(SignUpPropsContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSignUpProps must be wrapped in a <SignUpPropsProvider />');
        }
    }
    return value;
}

export function SignUpPropsProvider({ children }: PropsWithChildren) {
    const [signUpProps, setSignUpProps] = useState<UserData>({
        email: '',
        password: '',
        username: '',
        first_name: '',
        last_name: '',
        sneaker_size: 0,
        profile_picture: '',
        confirmPassword: ''
    });

    return (
        <SignUpPropsContext.Provider value={{ signUpProps, setSignUpProps }}>
            {children}
        </SignUpPropsContext.Provider>
    );
}
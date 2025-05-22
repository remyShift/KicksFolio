import { View } from 'react-native';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';
import LoginForm from '@/components/screens/login/loginForm';

export default function Login() {
    return (
        <>
            <LoginForm />
            <PrivacyPolicy />
        </>
    );
}

import { View, KeyboardAvoidingView, Platform } from 'react-native';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';
import SignUpFirstForm from '@/components/screens/signup/signUpFirstForm';

export default function SignUp() {
    return (
        <>
            <KeyboardAvoidingView 
                className="flex-1 bg-background" 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <SignUpFirstForm />
            </KeyboardAvoidingView>
            <View className='flex justify-center items-center bg-background pb-10'>
                <PrivacyPolicy />
            </View>
        </>
    );
}

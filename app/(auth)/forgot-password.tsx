import { View, KeyboardAvoidingView, Platform } from 'react-native';
import PrivacyPolicy from '@/components/ui/text/PrivacyPolicy';
import ForgotPasswordForm from '@/components/screens/forgotPassword/ForgotPasswordForm';

export default function ForgotPassword() {
    return (
        <>
            <KeyboardAvoidingView 
                className="flex-1 bg-background" 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>

                <ForgotPasswordForm />

            </KeyboardAvoidingView>
            <View className='flex justify-center items-center bg-background pb-10'>
                <PrivacyPolicy />
            </View>
        </>
    );
}

import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import ResetPasswordForm from '@/components/screens/resetPassword/resetPasswordForm';

export default function ResetPassword() {
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={isPasswordFocused}>
                <ResetPasswordForm setIsPasswordFocused={setIsPasswordFocused} isPasswordFocused={isPasswordFocused}/>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

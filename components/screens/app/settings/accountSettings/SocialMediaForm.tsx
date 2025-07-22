import { View, Text, Switch, ScrollView, TextInput } from 'react-native';
import { useRef } from 'react';
import { useSession } from '@/context/authContext';
import { useAuth } from '@/hooks/useAuth';
import MainButton from '@/components/ui/buttons/MainButton';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import AuthHeader from '@/components/screens/auth/AuthHeader';
import { RelativePathString } from '@/.expo/types/router';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import { useFormController } from '@/hooks/useFormController';
import { createSocialMediaSchema, SocialMediaFormData } from '@/validation/schemas';
import ErrorMsg from '@/components/ui/text/ErrorMsg';

export default function SocialMediaForm() {
    const { t } = useTranslation();
    const { user, refreshUserData } = useSession();
    const { updateUser } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    const scrollViewRef = useRef<ScrollView>(null);
    const instagramInputRef = useRef<TextInput>(null);
    const facebookInputRef = useRef<TextInput>(null);

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        isSubmitDisabled,
        displayedError,
        getFieldErrorWrapper,
        watch,
        setValue
    } = useFormController<SocialMediaFormData>({
        schema: createSocialMediaSchema(),
        defaultValues: {
            instagram_username: user?.instagram_username || '',
            facebook_username: user?.facebook_username || '',
            social_media_visibility: user?.social_media_visibility ?? true,
        },
        fieldNames: ['instagram_username', 'facebook_username', 'social_media_visibility'],
        onSubmit: async (data) => {
            if (!user) return;
            
            return updateUser(user.id, {
                instagram_username: data.instagram_username || undefined,
                facebook_username: data.facebook_username || undefined,
                social_media_visibility: data.social_media_visibility
            })
            .then((result) => {
                if (result?.user) {
                    refreshUserData();
                    showSuccessToast(
                        t('settings.socialMedia.updated'),
                        t('settings.socialMedia.updatedDescription')
                    );
                }
            })
            .catch((error) => {
                showErrorToast(
                    t('settings.socialMedia.updateFailed'),
                    t('settings.socialMedia.updateFailedDescription')
                );
                console.error('Error updating social media settings:', error);
                throw error;
            });
        },
    });

    const socialMediaVisibility = watch('social_media_visibility');

    return (
        <KeyboardAwareScrollView 
            ref={scrollViewRef}
            className="flex-1 bg-background" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            bottomOffset={10}
        >
            <View className="flex-1 px-4 gap-8 mt-20">
                <AuthHeader page={{
                    title: t('settings.titles.socialMedia'),
                    routerBack: '/(app)/settings' as RelativePathString,
                }} />
                
                <View className="flex flex-col gap-4 w-full justify-center items-center px-12">
                    <ErrorMsg content={displayedError} display={displayedError !== ''} />

                    <FormTextInput
                        name="instagram_username"
                        control={control}
                        label={t('settings.socialMedia.instagram.label')}
                        placeholder={t('settings.socialMedia.instagramPlaceholder')}
                        ref={instagramInputRef}
                        nextInputRef={facebookInputRef}
                        autoCapitalize="none"
                        autoComplete="off"
                        maxLength={30}
                        onFocus={() => handleFieldFocus('instagram_username')}
                        onBlur={async (value) => { await validateFieldOnBlur('instagram_username', value); }}
                        error={getFieldErrorWrapper('instagram_username')}
                        getFieldError={getFieldErrorWrapper}
                        accessibilityLabel="Instagram Username"
                        testID="instagram-username"
                    />
                    
                    <View className="flex-row items-center justify-between gap-4">
                        <Text className="font-open-sans text-base">
                            {t('settings.socialMedia.visibility')}
                        </Text>
                        <Switch
                            value={socialMediaVisibility}
                            onValueChange={(value) => setValue('social_media_visibility', value)}
                            trackColor={{ false: '#767577', true: '#F27329' }}
                            thumbColor={socialMediaVisibility ? '#ffffff' : '#f4f3f4'}
                            testID="social-media-visibility"
                        />
                    </View>

                    <Text className="font-open-sans text-xs">
                        {t('settings.socialMedia.visibilityDescription')}
                    </Text>

                    <MainButton
                        content={t('settings.buttons.save')}
                        backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                        onPressAction={() => {
                            if (!isSubmitDisabled) {
                                handleFormSubmit();
                            }
                        }}
                        isDisabled={isSubmitDisabled}
                    />
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
} 
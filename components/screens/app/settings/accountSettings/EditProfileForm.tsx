import { View, ScrollView, Pressable, TextInput } from 'react-native'
import { useRef } from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PageTitle from '@/components/ui/text/PageTitle'
import MainButton from '@/components/ui/buttons/MainButton'
import ErrorMsg from '@/components/ui/text/ErrorMsg'
import { useSession } from '@/context/authContext'
import FormTextInput from '@/components/ui/inputs/FormTextInput'
import FormImageInput from '@/components/ui/inputs/FormImageInput'
import { useAuth } from '@/hooks/useAuth'
import { useFormController } from '@/hooks/useFormController'
import { createEditProfileSchema, EditProfileFormData } from '@/validation/schemas'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import useToast from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { useSizeConversion } from '@/hooks/useSizeConversion'

export default function EditProfileForm() {
    const { t } = useTranslation();
    const { user, refreshUserData } = useSession()
    const { showSuccessToast, showErrorToast } = useToast();
    const { updateUser } = useAuth()
    const { convertToCurrentUnit, getOriginalUnit } = useSizeConversion()
    const scrollViewRef = useRef<ScrollView>(null)
    const usernameInputRef = useRef<TextInput>(null)
    const firstNameInputRef = useRef<TextInput>(null)
    const lastNameInputRef = useRef<TextInput>(null)
    const sizeInputRef = useRef<TextInput>(null)

    const convertedSneakerSize = convertToCurrentUnit(user!.sneaker_size, getOriginalUnit(user!.sneaker_size))

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        displayedError,
        isSubmitDisabled,
        getFieldErrorWrapper,
    } = useFormController<EditProfileFormData>({
        schema: createEditProfileSchema(),
        defaultValues: {
            username: user!.username,
            first_name: user!.first_name,
            last_name: user!.last_name,
            sneaker_size: convertedSneakerSize!.toString(),
            profile_picture: user!.profile_picture_url,
        },
        isEditForm: true,
        onSubmit: async (data) => {
            if (!user) return
            return updateUser(user.id, {
                ...data,
                sneaker_size: parseInt(data.sneaker_size),
            })
            .then((result) => {
                if (result?.user) {
                    refreshUserData();
                    showSuccessToast(
                        t('settings.editProfile.profileUpdated'), 
                        t('settings.editProfile.profileUpdatedDescription')
                    );
                }
            })
            .catch((error) => {
                showErrorToast(
                    t('settings.editProfile.profileUpdateFailed'), 
                    t('settings.editProfile.profileUpdateFailedDescription')
                );
                console.error('❌ EditProfileForm: Error in form submission:', error);
                throw error;
            });
        },
    })



    return (
        <KeyboardAwareScrollView 
            ref={scrollViewRef}
            className="flex-1 bg-background" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 8 }}
            bottomOffset={10}
        >
            <View className="flex-1 p-4 gap-8">
                <Pressable onPress={() => router.back()} className='absolute right-5 top-14'>
                    <Ionicons name="close-outline" size={32} color="#666" />
                </Pressable>
                <View className="flex-row justify-center items-center">
                    <PageTitle content={t('settings.titles.editProfile')} />
                </View>

                <FormImageInput
                    name="profile_picture"
                    control={control}
                    size={128}
                    isRounded={true}
                />

                <View className="flex flex-col gap-4 w-full justify-center items-center px-12">
                    <ErrorMsg content={displayedError} display={displayedError !== ''} />

                    <FormTextInput
                        name="username"
                        control={control}
                        label={t('auth.form.username.label')}
                        placeholder={t('auth.form.username.placeholder')}
                        ref={usernameInputRef}
                        nextInputRef={firstNameInputRef}
                        autoComplete="username"
                        maxLength={16}
                        onFocus={() => handleFieldFocus('username')}
                        onBlur={async (value) => { await validateFieldOnBlur('username', value); }}
                        error={getFieldErrorWrapper('username')}
                        getFieldError={getFieldErrorWrapper}
                        accessibilityLabel="Username*"
                    />

                    <FormTextInput
                        name="first_name"
                        control={control}
                        label={t('auth.form.firstName.label')}
                        placeholder={t('auth.form.firstName.placeholder')}
                        ref={firstNameInputRef}
                        nextInputRef={lastNameInputRef}
                        autoComplete="name"
                        onFocus={() => handleFieldFocus('first_name')}
                        onBlur={async (value) => { await validateFieldOnBlur('first_name', value); }}
                        error={getFieldErrorWrapper('first_name')}
                        getFieldError={getFieldErrorWrapper}
                        accessibilityLabel="First Name*"
                    />

                    <FormTextInput
                        name="last_name"
                        control={control}
                        label={t('auth.form.lastName.label')}
                        placeholder={t('auth.form.lastName.placeholder')}
                        ref={lastNameInputRef}
                        nextInputRef={sizeInputRef}
                        autoComplete="name"
                        onFocus={() => handleFieldFocus('last_name')}
                        onBlur={async (value) => { await validateFieldOnBlur('last_name', value); }}
                        error={getFieldErrorWrapper('last_name')}
                        getFieldError={getFieldErrorWrapper}
                        accessibilityLabel="Last Name*"
                    />

                    <FormTextInput
                        name="sneaker_size"
                        control={control}
                        label={t('auth.form.sneakerSize.label')}
                        placeholder={t('auth.form.sneakerSize.placeholder')}
                        ref={sizeInputRef}
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('sneaker_size')}
                        onBlur={async (value) => { await validateFieldOnBlur('sneaker_size', value); }}
                        error={getFieldErrorWrapper('sneaker_size')}
                        getFieldError={getFieldErrorWrapper}
                        accessibilityLabel="Sneaker Size*"
                    />
                </View>

                <View className='flex w-full justify-center items-center'>
                    <MainButton 
                        content={t('settings.buttons.save')}
                        onPressAction={() => {
                            if (!isSubmitDisabled) {
                                handleFormSubmit();
                            }
                        }}
                        backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                        isDisabled={isSubmitDisabled}
                    />
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}
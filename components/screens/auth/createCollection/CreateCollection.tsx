import { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import PageTitle from '@/components/ui/text/PageTitle';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import MainButton from '@/components/ui/buttons/MainButton';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import { useCreateCollection } from '@/hooks/useCreateCollection';
import { useFormController } from '@/hooks/useFormController';
import { useSession } from '@/context/authContext';
import { z } from 'zod';

const collectionSchema = z.object({
    collectionName: z.string().min(4, 'Collection name is required and must be at least 4 characters long.'),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function CreateCollection() {
    const scrollViewRef = useRef<ScrollView>(null);
    const { createCollection, error: createCollectionError } = useCreateCollection();
    const { userCollection } = useSession();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
        isSubmitDisabled,
    } = useFormController<CollectionFormData>({
        schema: collectionSchema,
        defaultValues: {
            collectionName: '',
        },
        onSubmit: async (data) => {
            createCollection(data.collectionName)
        },
    });

    const hasMultipleErrors = [
        hasFieldError('collectionName'),
    ].filter(Boolean).length > 1;

    const globalErrorMsg = hasMultipleErrors 
        ? 'Please correct the fields in red before continuing'
        : '';

    const displayedError = globalErrorMsg || 
        getFieldError('collectionName') || 
        createCollectionError || 
        '';

    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName as keyof CollectionFormData);
    };

    useEffect(() => {
        if (userCollection) {
            router.replace('/(app)/(tabs)');
        }
    }, [userCollection]);

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-background" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView 
                ref={scrollViewRef}
                className='flex-1'
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 items-center gap-12 p-4 bg-background">
                    <PageTitle content='Welcome to KicksFolio !' />
                    <View className='flex justify-center items-center gap-8 w-full mt-32 px-12'>
                        <View className="absolute w-full flex items-center" style={{ top: -50 }}>
                            <ErrorMsg content={displayedError} display={displayedError !== ''} />
                        </View>
                        <Text className="text-lg font-spacemono-bold text-center">Please give a name to your collection :</Text>

                        <FormTextInput
                            name="collectionName"
                            control={control}
                            placeholder="My Sneakers Collection"
                            onFocus={() => handleFieldFocus('collectionName')}
                            onBlur={async (value) => { await validateFieldOnBlur('collectionName', value); }}
                            onSubmitEditing={handleFormSubmit}
                            error={getFieldErrorWrapper('collectionName')}
                            getFieldError={getFieldErrorWrapper}
                        />

                        <MainButton
                            content='Create'
                            isDisabled={isSubmitDisabled}
                            backgroundColor={isSubmitDisabled ? 'bg-primary/50' : 'bg-primary'}
                            onPressAction={() => {
                                if (!isSubmitDisabled) {
                                    handleFormSubmit()
                                }
                            }} 
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

import { useForm } from "@/hooks/useForm";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

interface CollectionNameInputProps {
    collectionName?: string;
    setCollectionName?: (name: string) => void;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    onSubmitEditing: () => Promise<boolean>;
}

export default function CollectionNameInput({ collectionName, setCollectionName, onErrorChange, onValueChange, onSubmitEditing }: CollectionNameInputProps) {
    const [isCollectionNameError, setIsCollectionNameError] = useState(false);
    const [isCollectionNameFocused, setIsCollectionNameFocused] = useState(false);
    const [collectionNameValue, setCollectionNameValue] = useState(collectionName || "");

    const { handleForm, errorMsg } = useForm({
        errorSetters: {
            collectionName: (isError: boolean) => setIsCollectionNameError(isError),
        },
        focusSetters: {
            collectionName: (isFocused: boolean) => setIsCollectionNameFocused(isFocused),
        },
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(collectionNameValue);
    }, [collectionNameValue]);

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Collection Name</Text>
            <TextInput
                placeholder="My Collection"
                value={collectionNameValue}
                autoComplete='off'
                returnKeyType='done'
                onSubmitEditing={() => {
                    handleForm.inputBlur('collectionName', collectionNameValue)
                        .then((isValid) => {
                            if (isValid) {
                                onSubmitEditing().then((success) => {
                                    if (success) {
                                        router.replace('/(app)/(tabs)');
                                    }
                                });
                            }
                        });
                }}
                onFocus={() => handleForm.inputFocus('collectionName')}
                onBlur={() => handleForm.inputBlur('collectionName', collectionNameValue)}
                onChangeText={(text) => {
                    setCollectionNameValue(text);
                    setCollectionName?.(text);
                    handleForm.inputChange(text, (t) => setCollectionName?.(t));
                }}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isCollectionNameError ? 'border-2 border-red-500' : ''
                } ${isCollectionNameFocused ? 'border-2 border-primary' : ''}`}
            />
        </View>
    )
}
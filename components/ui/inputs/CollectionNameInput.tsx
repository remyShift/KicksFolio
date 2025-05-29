import { useForm } from "@/hooks/useForm";
import { useEffect, useState } from "react";
import { TextInput } from "react-native";

interface CollectionNameInputProps {
    collectionName: string;
    setCollectionName: (text: string) => void;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
}

export function CollectionNameInput({ collectionName, setCollectionName, onErrorChange, onValueChange }: CollectionNameInputProps) {
    const [collectionNameValue, setCollectionNameValue] = useState(collectionName || "");
    const [isCollectionNameError, setIsCollectionNameError] = useState(false);
    const [isCollectionNameFocused, setIsCollectionNameFocused] = useState(false);

    const { handleForm, formValidation, errorMsg } = useForm({
        errorSetters: {
            collectionName: setIsCollectionNameError
        },
        focusSetters: {
            collectionName: setIsCollectionNameFocused
        }
    });

    useEffect(() => {
        onValueChange(collectionNameValue);
    }, [collectionNameValue]);

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    return (
        <TextInput
            placeholder="Collection name"
            value={collectionNameValue}
            onChangeText={(text) => {
                setCollectionNameValue(text);
                setCollectionName(text);
                handleForm.inputChange(text, setCollectionName);
            }}
            onFocus={() => handleForm.inputFocus('collectionName')}
            onBlur={() => handleForm.inputBlur('collectionName', collectionNameValue)}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isCollectionNameError ? 'border-2 border-red-500' : ''
            } ${isCollectionNameFocused ? 'border-2 border-primary' : ''}`}
        />
    )
}
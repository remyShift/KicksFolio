import { TextInput } from "react-native";
import { useForm } from "@/hooks/useForm";

interface CollectionNameInputProps {
    collectionName: string;
    setCollectionName: (text: string) => void;
    isCollectionNameError: boolean;
    isCollectionNameFocused: boolean;
}

export function CollectionNameInput({ collectionName, setCollectionName, isCollectionNameError, isCollectionNameFocused }: CollectionNameInputProps) {
    const { handleForm, formValidation } = useForm({
        errorSetters: {
            collectionName: setIsCollectionNameError
        },
        focusSetters: {
            collectionName: setIsCollectionNameFocused
        }
    });

    return (
        <TextInput
            placeholder="Collection name"
            value={collectionName}
            onChangeText={setCollectionName}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isCollectionNameError ? 'border-2 border-red-500' : ''
            } ${isCollectionNameFocused ? 'border-2 border-primary' : ''}`}
        />
    )
}
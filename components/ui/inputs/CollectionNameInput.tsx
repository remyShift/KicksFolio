import { TextInput } from "react-native";
import { useForm } from "@/hooks/useForm";

interface CollectionNameInputProps {
    collectionName: string;
    setCollectionName: (text: string) => void;
    isCollectionNameError: boolean;
    isCollectionNameFocused: boolean;
    setIsCollectionNameError: (isError: boolean) => void;
    setIsCollectionNameFocused: (isFocused: boolean) => void;
}

export default function CollectionNameInput({ collectionName, setCollectionName, isCollectionNameError, isCollectionNameFocused, setIsCollectionNameError, setIsCollectionNameFocused }: CollectionNameInputProps) {
    const { handleForm } = useForm({
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
            onBlur={() => handleForm.inputFocus('collectionName')}
            onFocus={() => handleForm.inputFocus('collectionName')}
            className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                isCollectionNameError ? 'border-2 border-red-500' : ''
            } ${isCollectionNameFocused ? 'border-2 border-primary' : ''}`}
        />
    )
}
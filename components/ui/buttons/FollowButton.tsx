import { Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

interface FollowButtonProps {
    onPressAction: () => void;
    backgroundColor: string;
    isDisabled: boolean;
    isFollowing: boolean;
    testID?: string;
}

export default function FollowButton({ onPressAction, backgroundColor, isDisabled, isFollowing, testID }: FollowButtonProps) {
    const iconName = isFollowing ? 'user-x' : 'user-check';
    return (
        <Pressable
            className={`${backgroundColor} p-2 rounded-md flex items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}
            onPress={onPressAction}
            testID={`${testID}`}
            disabled={isDisabled}
        >
            <Feather name={iconName} size={20} color="white" />
        </Pressable>
    );
}
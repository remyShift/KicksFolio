import { Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

export default function ShareButton() {
    return (
        <Pressable>
            <Feather name="share" size={20} color="black" />
        </Pressable>
    );
}
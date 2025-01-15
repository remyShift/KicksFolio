import { Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';

export default function LoveButton() {
    const primary = '#F27329';
    const [color, setColor] = useState('black');

    const handlePress = () => {
        setColor(color === primary ? 'black' : primary);
    };

    return (
        <Pressable 
            className="bg-white p-3 rounded-md flex items-center justify-center"
            onPress={handlePress}
        >
            {color === primary ? 
                <AntDesign name="heart" size={20} color={color} /> : 
                <AntDesign name="hearto" size={20} color={color} />
            }
        </Pressable>
    );
}
import { View, Text } from 'react-native';
import { Sneaker } from '@/types/Sneaker';

export const ConditionBar = ({ sneaker }: { sneaker: Sneaker }) => {
    const segments = Array.from({ length: sneaker.condition }, (_, i) => i);
    const conditionDisplay = sneaker.ds ? 'DS' : `${sneaker.condition}/10`;

    return (
        <View className='flex-row w-screen gap-4'>
            <View className='bg-white flex-row justify-between p-1 px-2 rounded-l-md w-3/4'>
                    <View className='flex-row w-full justify-between'>
                        <View className='flex-row w-full'>
                            {segments.length && 
                                <View className='bg-primary w-3 h-full'></View>
                            }

                            {segments.length <= 10 && segments.map((_, index) => (
                                <View
                                    key={index}
                                    className='bg-primary w-[8.7%] h-full'
                                    style={{ transform: [{ skewX: '-30deg' }], marginLeft: index === 0 ? -5 : undefined, marginRight: index === 9 ? 0 : 3 }}
                                />
                            ))}

                            { segments.length === 10 &&
                                <View className='bg-primary w-3 h-full' style={{ marginLeft: -5 }}></View>
                            }
                        </View>

                        { segments.length < 9 &&
                            <Text className='font-open-sans-bold text-sm text-gray-300 relative right-11'>WEAR</Text>
                        }
                </View>
            </View>


            <View className='bg-white flex-row items-center justify-center p-1 px-3 rounded-r-md min-w-14'>
                <Text className='font-open-sans-bold text-sm text-center'>{conditionDisplay}</Text>
            </View>
        </View>
    );
};
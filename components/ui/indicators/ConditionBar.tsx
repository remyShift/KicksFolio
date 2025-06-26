import { View, Text } from 'react-native';

export const ConditionBar = ({ condition }: { condition: number }) => {
    const segments = Array.from({ length: condition }, (_, i) => i);

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
                        <Text className='font-spacemono-bold text-sm text-gray-300 relative right-11'>WEAR</Text>
                    }
                </View>
            </View>

            <View className='bg-white flex-row p-1 px-3 rounded-r-md'>
                <Text className='font-spacemono-bold text-sm'>{condition}/10</Text>
            </View>
        </View>
    );
};
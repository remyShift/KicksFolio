import { Stack } from 'expo-router';

export default function SearchLayout() {
    return (
        <Stack
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: '#ECECEC',
                },
            }}
        >
            <Stack.Screen 
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen 
                name="[userId]" 
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
} 
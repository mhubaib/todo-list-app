import AsyncStorage from '@react-native-async-storage/async-storage';

export const showAsyncStorage = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys(); // ambil semua key
        const stores = await AsyncStorage.multiGet(keys); // ambil semua pasangan key-value

        console.log('===== AsyncStorage Data =====');
        stores.forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });
        console.log('=============================');
    } catch (e) {
        console.error("Error membaca AsyncStorage:", e);
    }
};

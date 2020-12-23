import { AsyncStorage } from "react-native"

export const retrieveData = async (key, defaultValue) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      if (typeof defaultValue === 'boolean') {
        return value === 'true'
      }
      return value
    }
   } catch (error) {
    console.warn('error', error)
   }
   return defaultValue
}

export const storeData = async (key, value) => {
  try {
    if (typeof value === 'boolean') {
      value = '' + value
    }
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn('error', error)
  }
}

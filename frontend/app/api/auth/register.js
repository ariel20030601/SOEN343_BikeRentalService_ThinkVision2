import AsyncStorage from '@react-native-async-storage/async-storage';

async function register(username, password) {
    const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }
    return true;
}
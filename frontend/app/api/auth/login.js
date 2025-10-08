import AsyncStorage from '@react-native-async-storage/async-storage';

async function login(username, password) {
    const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }

    const data = await res.json();
    const token = data.token;
    await AsyncStorage.setItem('jwt', token);
    return token;
}

async function fetchUserMe() {
    const token = await AsyncStorage.getItem('jwt');
    const res = await fetch('http://localhost:8080/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Auth failed');
    return res.json();
}

await AsyncStorage.removeItem('jwt');
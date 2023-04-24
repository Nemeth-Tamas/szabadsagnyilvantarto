import { Account, Client } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT);

export const getUserData = async () => {
    try {
        const account = new Account(client);
        return account.get();
    } catch (error) {
        const appwriteError = error;
        throw new Error(appwriteError.message);
    }
}

export const login = async (email, password) => {
    try {
        const account = new Account(client)
        return account.createEmailSession(email, password)
    } catch (error) {
        const appwriteError = error;
        throw new Error(appwriteError.message)
    }
}

export const logout = async () => {
    try {
        const account = new Account(client)
        return account.deleteSession('current')
    } catch (error) {
        const appwriteError = error;
        throw new Error(appwriteError.message)
    }
}

export default client;
"use server"

import { Client, Account, ID, Databases, Storage } from 'node-appwrite';
import { cookies } from "next/headers";
import { mauticEmailService } from '../../mautic/mautic';
import { redirect } from 'next/navigation';

export async function setCookies(session_secret) {
    const cookieStore = await cookies();
    if (!session_secret) {
        throw Error("Session secret is missing!");
    }

    cookieStore.set('session_id', session_secret, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/'
    });
}

export async function signOut() {
    const user = await getLoggedInUser();

    try {
        const { account } = await createSessionClient();
        const cookieStore = await cookies();

        // Delete custom session cookie
        cookieStore.delete("session_id");

        // Delete Appwrite session
        await account.deleteSession("current");

        if (user.role === 'client' || user.role === 'admin') {
            return { redirect: '/login' };
        } else {
            return { redirect: '/register-for-event/' + user.active_event };
        }

    } catch (error) {
        console.log("Sign out error:", error);
        return { error: true };
    }
}

export async function createSessionClient() {
    const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_PROJECT;

    if (!endpoint) {
        throw new Error("NEXT_PUBLIC_ENDPOINT is not set");
    }

    if (!projectId) {
        throw new Error("NEXT_PUBLIC_PROJECT is not set");
    }

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_PROJECT);

    let session = await cookies();

    session = session.get("session_id");

    if (!session) {
        throw new Error("No session");
    }

    client.setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },
        get storage() {
            return new Storage(client);
        }
    };
}

export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_PROJECT)
        .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

    const account = new Account(client);
    const database = new Databases(client);
    const storage = new Storage(client);

    return { client, account, database, storage };
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_PROJECT)
            .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

        const databases = new Databases(client);

        const response = await databases.getDocument(
            "main_db",
            "users",
            user?.$id
        );

        return response;
    } catch (error) {
        console.log('Error fetching profile:', error);
        return null;
    }
}

export async function signInAdminDashboard(email, password) {
    const { account } = await createAdminClient();
    try {
        const session = await account.createEmailPasswordSession(email, password);

        const cookieStore = await cookies();

        if (cookieStore) {
            cookieStore.set("session_id", session.secret, {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
        }

        return {
            data: session,
            error: null,
        };

    } catch (error) {
        console.log("ERROR: login user:", error);
        return { data: null, error };
    }
}

export async function signInWithEmail(email, data) {
    const { account } = await createAdminClient();
    try {
        if (data.register) {
            const { first_name, last_name, invintation_id, email } = data;
            const params = new URLSearchParams({
                email,
                register: 'true',
                first_name,
                last_name,
                invintation_id
            });
            const res = await account.createMagicURLToken(ID.unique(), email, `http://localhost:3000/verify?${params.toString()}`);
        } else {
            const { invintation_id } = data;
            const params = new URLSearchParams({
                register: 'false',
                invintation_id
            });
            const res = await account.createMagicURLToken(ID.unique(), email, `http://localhost:3000/verify?${params.toString()}`);
        }

        return { data: true, error: null };
    } catch (error) {
        return { data: false, error: error };
    }
}


export async function signUpWithEmail(email, password, name) {

    const { account } = await createAdminClient();

    const res = await account.create(ID.unique(), email, password, name);

    return res;
}

export async function getDocument(db_id, collection_id, document_id, query) {
    try {

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_PROJECT)
            .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

        const databases = new Databases(client);

        const response = await databases.getDocument(
            db_id,
            collection_id,
            document_id || ID.unique(),

        );

        return { data: response, error: null };
    } catch (error) {
        console.log('ERROR getDocument():', error);
        return { data: null, error };
    }
}

export async function updateDocument(db_id, collection_id, document_id, values) {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_PROJECT)
            .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

        const databases = new Databases(client);

        const response = await databases.updateDocument(
            db_id,
            collection_id,
            document_id,
            values
        );

        return { data: response, error: null };
    } catch (error) {
        console.log('ERROR updateDocument():', error);
        return { data: null, error };
    }
}

export async function createDocument(db_id, collection_id, { document_id, body }) {
    try {

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_PROJECT)
            .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

        const databases = new Databases(client);
        console.log('createDocument ID.unique', ID.unique())
        const response = await databases.createDocument(
            db_id,
            collection_id,
            document_id || ID.unique(),
            {
                ...body
            }
        );

        return { data: response, error: null };
    } catch (error) {
        console.log('ERROR createDocument():', error);
        return { data: null, error: error }
    }
}

export async function listDocuments(db_id, collection_id, query) {
    const queryArray = [];

    if (query) {
        query.forEach(element => {
            if (element.type === 'equal') {
                queryArray.push({ $eq: [element.name, element.value] });
            }
            if (element.type === 'limit') {
                queryArray.push({ $limit: element.value });
            }
        });

    }

    try {

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_PROJECT)
            .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

        const databases = new Databases(client);

        const response = await databases.listDocuments(
            db_id,
            collection_id,
            [{ $sort: { $createdAt: -1 } }, ...queryArray]
        );
        console.log(response)
        return response;
    } catch (error) {
        console.log('Error updating profile:', error);
        throw error;
    }
}

export async function deleteDocument(db_id, collection_id, document_id) {

    try {
        const user = await getLoggedInUser();

        if (!user) return null;

        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_PROJECT)
            .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

        const databases = new Databases(client);

        const response = await databases.deleteDocument(
            db_id,
            collection_id,
            document_id
        );

        return { data: response, error: null };
    } catch (error) {
        console.log('ERROR deleteDocument():', error);
        return { data: null, error: error }
    }
}

export async function createFile(bucket_id, file) {
    const user = await getLoggedInUser();

    if (!user) return null;

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_PROJECT)
        .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

    const storage = new Storage(client);

    try {
        const response = await storage.createFile(bucket_id, ID.unique(), file);

        if (response) return response.$id

        return null;
    } catch (error) {
        console.log('Error updating profile:', error);
        throw error;
    }

}

export async function verifyToken(token) {
    try {
        const { database, account } = await createAdminClient();

        // Получаем документ токена
        const tokenDoc = await database.getDocument('main_db', 'auth_tokens', token);

        // Проверяем срок действия
        if (new Date(tokenDoc.expires) < new Date()) {
            return {
                success: false,
                message: 'Linkki on vanhentunut'
            };
        }

        // Создаем сессию через magic URL
        await account.updateMagicURLSession(
            token,
            token
        );

        // Удаляем использованный токен
        await database.deleteDocument('main_db', 'auth_tokens', token);

        return {
            success: true,
            message: 'Vahvistettu onnistuneesti'
        };
    } catch (error) {
        console.error('Verification error:', error);
        return {
            success: false,
            message: 'Vahvistus epäonnistui'
        };
    }
}

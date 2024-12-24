"use server"

import { Client, Account, ID, Databases, Query, Storage } from "node-appwrite";
import { cookies } from "next/headers";

export async function createDatabaseClient() {
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


    let session = await cookies()
    session = session.get("my-custom-session");
    if (!session || !session.value) {
        throw new Error("No session");
    }

    client.setSession(session.value);

    return {
        get databases() { return new Databases(client) }
    };
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

    session = session.get("my-custom-session");

    if (!session || !session.value) {
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

export async function signOut() {
    try {
        const { account } = await createSessionClient();
        const cookieStore = await cookies();

        // Delete custom session cookie
        cookieStore.delete("my-custom-session");

        // Delete Appwrite session
        await account.deleteSession("current");

        redirect("/login");
    } catch (error) {
        console.log("Sign out error:", error);
        return false;
    }
}

export async function createAdminClient() {
    const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_PROJECT;
    const apiKey = process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY;

    if (!endpoint) {
        throw new Error("NEXT_PUBLIC_ENDPOINT is not set");
    }

    if (!projectId) {
        throw new Error("NEXT_PUBLIC_PROJECT is not set");
    }

    if (!apiKey) {
        throw new Error("NEXT_PUBLIC_APPWRITE_SESSION_KEY is not set");
    }

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_PROJECT)
        .setKey(process.env.NEXT_PUBLIC_APPWRITE_SESSION_KEY);

    const database = new Databases(client);

    return {
        get account() {
            return new Account(client);
        },
        database
    };
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

export async function signInWithEmail(email, password) {
    const { account } = await createAdminClient();
    try {
        const session = await account.createEmailPasswordSession(email, password);

        const cookieStore = await cookies();

        if (cookieStore) {
            cookieStore.set("my-custom-session", session.secret, {
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
                queryArray.push(Query.equal(element.name, element.value));
            }
            if (element.type === 'limit') {
                queryArray.push(Query.limit(element.value));
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
            [Query.orderDesc("$createdAt"), ...queryArray]
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
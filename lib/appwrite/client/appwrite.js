import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();


client
   .setEndpoint('https://appwrite.superman.fi/v1')
   .setProject('events-dev');

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client); 

export { ID } from 'appwrite';
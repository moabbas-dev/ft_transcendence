import { Account, Client } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67f556e5003d182ec521');

const account = new Account(client);
export { client, account };
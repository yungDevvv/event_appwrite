// src/config/mautic.ts
const MAUTIC_CONFIG = {
    hostname: 'respa.crossmedia.fi',
    templateIds: {
        verification: '24',
        magicURL: '25',
        recovery: '26'
    },
    auth: 'Basic c3VwYWJhc2U6SndzdTk2MjYjMjAyNA=='
};

// src/services/mauticEmail.ts
class MauticEmailService {
    getRequestOptions(method = 'GET') {
        return {
            method,
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'EchoapiRuntime/1.1.0',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Authorization': MAUTIC_CONFIG.auth
            }
        };
    }

    async checkContactExists(email) {
        try {
            const response = await fetch(`https://${MAUTIC_CONFIG.hostname}/api/contacts?search=${encodeURIComponent(email)}`,
                this.getRequestOptions()
            );

            const data = await response.json();

            if (data && data.contacts) {

                const contactIds = Object.keys(data.contacts);

                if (contactIds.length > 0) {

                    return +contactIds[0];
                }
            }

            return null;
        } catch (error) {
            console.error('Error checking contact:', error);
            throw error;
        }
    }

    async createContact(email, name) {
        try {
            const [firstName, ...lastNameParts] = (name || '').split(' ');
            const lastName = lastNameParts.join(' ');

            const response = await fetch(`https://${MAUTIC_CONFIG.hostname}/api/contacts/new`, {
                ...this.getRequestOptions('POST'),
                body: JSON.stringify({
                    email,
                    firstname: firstName || '',
                    lastname: lastName || ''
                })
            });

            const data = await response.json();
            return data.contact.id;
        } catch (error) {
            console.error('Error creating contact:', error);
            throw error;
        }
    }

    async sendEmail({ reciever_email, reciever_name, content }) {
        try {
            // Tarkista tai luo yhteystieto
            let contactId = await this.checkContactExists(reciever_email);

            if (!contactId) {
                contactId = await this.createContact(reciever_email, reciever_name);
            }

            // Luo uusi sähköposti
            const createEmailResponse = await fetch(`https://${MAUTIC_CONFIG.hostname}/api/emails/new`, {
                ...this.getRequestOptions('POST'),
                body: JSON.stringify({
                    name: "Tilausvahvistus",
                    subject: "Tilausvahvistus tapahtumaan",
                    isPublished: true,
                    customHtml: content,
                    emailType: 'template'
                })
            });

            if (!createEmailResponse.ok) {
                throw new Error('Sähköpostin luominen epäonnistui');
            }

            const emailData = await createEmailResponse.json();
            const emailId = emailData.email.id;

            // Lähetä sähköposti kontaktille
            const sendResponse = await fetch(`https://${MAUTIC_CONFIG.hostname}/api/emails/${emailId}/contact/${contactId}/send`, {
                ...this.getRequestOptions('POST'),
                body: JSON.stringify({})
            });

            if (!sendResponse.ok) {
                throw new Error('Sähköpostin lähetys epäonnistui');
            }

            return await sendResponse.json();

        } catch (error) {
            console.error('Sähköpostin lähetys epäonnistui:', error);
            throw error;
        }
    }
    async handleUserAuthentication(recipient, payload) {
        // tässä tapahtuu ainoastaan uuden käyttäjän luonti mikäli ei ole mauticissa 
        try {
            let contactId = await this.checkContactExists(recipient);

            if (!contactId) {
                contactId = await this.createContact(recipient, payload.name);
            }

            return contactId;
        } catch (error) {
            console.log('MAUTIC:', error);
            // throw error;
        }
    }
}

export const mauticEmailService = new MauticEmailService();

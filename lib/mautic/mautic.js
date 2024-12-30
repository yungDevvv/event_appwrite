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

    async sendEmail(type, recipient, payload) {
        try {
            // Check or create contact

            let contactId = await this.checkContactExists(recipient);

            if (!contactId) {
                contactId = await this.createContact(recipient, payload.name);
            }

            console.log("FIRST STAGE FIRST STAGEFIRST STAGEFIRST STAGEFIRST STAGEFIRST STAGE")

            // 1. Create email for contact
            const createResponse = await fetch(`https://${MAUTIC_CONFIG.hostname}/api/emails/${MAUTIC_CONFIG.templateIds[type]}/contact/${contactId}/send`, {
                ...this.getRequestOptions('POST'),
                body: JSON.stringify({
                    tokens: {
                        // '{verification_url}': payload.url,
                        magic_url: payload.url,
                        // '{recovery_url}': payload.url,
                        // '{team_name}': payload.teamName || 'Our Team',
                        // '{user_name}': payload.name || 'User'
                        // verification_url: payload.url
                    }
                })
            });

            console.log(createResponse, "createResponsecreateResponsecreateResponsecreateResponse")

            return await createResponse.json();

            // console.log("AFTER EMAILDATA AWAIT CREATERESPONSE", await createResponse.json())

            // // 2. Trigger the actual send
            // const sendResponse = await fetch(`https://${MAUTIC_CONFIG.hostname}/api/emails/${MAUTIC_CONFIG.templateIds[type]}/send`, {
            //     ...this.getRequestOptions('POST'),
            //     body: JSON.stringify({
            //         id: emailData.id,
            //         email: recipient,
            //         contactId: contactId
            //     })
            // });

            // console.log("TIME TO RETURN SOMETYHING", await sendResponse.json())

            // return await sendResponse.json();
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
}

export const mauticEmailService = new MauticEmailService();

import { createAdminClient } from '@/lib/appwrite/server/appwrite';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ID, Client } from 'node-appwrite';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const userId = searchParams.get('userId');
    const invintation_id = searchParams.get(';invintation_id');

    let event;

    if (!secret || !userId) {
        return NextResponse.json(
            { error: 'Virheelliset parametrit' },
            { status: 400 }
        );
    }

    try {
        const { database } = await createAdminClient();
        console.log(invintation_id, "2INVITE ID")
        event = await database.getDocument(
            'main_db',
            'events',
            invintation_id
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Tapahtuma ei löytynyt!' },
            { status: 500 }
        );
    }

    try {
        const { account, database } = await createAdminClient();
        const session = await account.createSession(userId, secret);

        try {
            await database.getDocument(
                'main_db',
                'users',
                userId
            );

            const invintation_id = searchParams.get(';invintation_id');

            if (invintation_id) {
                await database.updateDocument(
                    'main_db',
                    'users',
                    userId,
                    {
                        active_event: invintation_id
                    }
                );

                const isMember = event.event_member.find((member) => member.users.$id === userId)
                if (!isMember) {
                    await database.createDocument(
                        'main_db',
                        'event_member',
                        ID.unique(),
                        {
                            users: userId,
                            events: invintation_id
                        }
                    );
                }
            }
        } catch (error) {
            const invintation_id = searchParams.get(';invintation_id');
            const first_name = searchParams.get(';first_name');
            const last_name = searchParams.get(';last_name');
            const email = searchParams.get('email');

            if (!invintation_id || !first_name || !last_name) {
                return NextResponse.json(
                    { error: 'Tiedot puuttuvat' },
                    { status: 400 }
                );
            }

            await database.createDocument(
                'main_db',
                'users',
                userId,
                {
                    email,
                    first_name,
                    last_name,
                    active_event: invintation_id
                }
            );

            await database.createDocument(
                'main_db',
                'event_member',
                ID.unique(),
                {
                    users: userId,
                    events: invintation_id
                }
            );
        }

        const response = NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_URL));

        response.cookies.set({
            name: 'session_id',
            value: session.secret,
            httpOnly: true,
            secure: true,
            sameSite: 'lax', 
            path: '/'
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Virhe vahvistuksessa' },
            { status: 500 }
        );
    }
}

// "use server";


// import { createAdminClient, setCookies } from '@/lib/appwrite/server/appwrite';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export default async function Page({ searchParams }) {
//     const params = await searchParams;
//     const { secret, userId } = params;
//     console.log(params);
//     if (!secret || !userId) {
//         throw new Error('Virheelliset parametrit');
//     }

//     try {
//         const { account, database } = await createAdminClient();
//         const session = await account.createSession(userId, secret);

//         try {
//             await database.getDocument(
//                 'main_db',
//                 'users',
//                 userId
//             );

//             const invintation_id = params[';invintation_id'];

//             if (invintation_id) {
//                 await database.updateDocument(
//                     'main_db',
//                     'users',
//                     userId,
//                     {
//                         active_event: invintation_id
//                     }
//                 );
//             }
//         } catch (error) {
//             const invintation_id = params[';invintation_id'];
//             const first_name = params[';first_name'];
//             const last_name = params[';last_name'];
//             const email = params['email'];
//             if (!invintation_id || !first_name || !last_name) {
//                 throw new Error('Tiedot puuttuvat');
//             }

//             await database.createDocument(
//                 'main_db',
//                 'users',
//                 userId,
//                 {
//                     email,
//                     first_name,
//                     last_name,
//                     active_event: invintation_id
//                 }
//             );
//         }

//         await setCookies(session.secret);

//         redirect('/event/' + invintation_id);
//     } catch (error) {
//         console.error(error);
//         throw Error('Virhe vahvistuksessa', error);
//     }
// }

import SettingsDescriptionForm from "@/components/forms/client/settings-description-form";
import SettingsGoogleForm from "@/components/forms/client/settings-google-form";
import SettingsLogoForm from "@/components/forms/client/settings-logo-form";
import SettingsOtherForm from "@/components/forms/client/settings-other-form";
import SettingsPrivacyForm from "@/components/forms/client/settings-privacy-form";
import { getLoggedInUser } from "@/lib/appwrite/server/appwrite";

export default async function Page() {
   const user = await getLoggedInUser();
   console.log(user.clientData)
   return (
      <div>
         <section className="mb-6 mt-2">
            <SettingsLogoForm
               user={user}
               recordExists={user.hasOwnProperty("clientData")}
               logo={user.hasOwnProperty("clientData") && user.clientData.logo ? user.clientData.logo : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsDescriptionForm
               user={user}
               recordExists={user.hasOwnProperty("clientData")}
               fi_welcome_text={user.hasOwnProperty("clientData") && user.clientData.fi_welcome_text ? user.clientData.fi_welcome_text : null}
            en_welcome_text={user.hasOwnProperty("clientData") && user.clientData.en_welcome_text ? user.clientData.en_welcome_text : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsOtherForm
               user={user}
               recordExists={user.hasOwnProperty("clientData")}
               fi_sub_description={user.hasOwnProperty("clientData") && user.clientData.fi_sub_description ? user.clientData.fi_sub_description : null}
               en_sub_description={user.hasOwnProperty("clientData") && user.clientData.en_sub_description ? user.clientData.en_sub_description : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsGoogleForm
               user={user}
               recordExists={user.hasOwnProperty("clientData")}
               google_link={user.hasOwnProperty("clientData") && user.clientData.google_link ? user.clientData.google_link : null}
            />
         </section>
         <hr></hr>
         <section className="my-6">
            <SettingsPrivacyForm
               user={user}
               recordExists={user.hasOwnProperty("clientData")}
               privacy={user.hasOwnProperty("clientData") && user.clientData.privacy ? JSON.parse(user.clientData.privacy) : null}
            />
         </section>

      </div>
   );
}



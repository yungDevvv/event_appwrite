"use client";



import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { useToast } from '@/hooks/use-toast';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { createDocument, updateDocument } from '@/lib/appwrite/server/appwrite';

const CKeditor = dynamic(() => import('@/components/ck-editor'), {
	ssr: false,
	loading: () => <div className='w-full min-h-[190px] flex justify-center items-center py-10'><Loader2 className='animate-spin text-clientprimary' /></div>
});

const SettingsOtherForm = ({ recordExists, user, fi_sub_description, en_sub_description }) => {
	const [fiContent, setFiContent] = useState(fi_sub_description ? fi_sub_description : "");
	const [enContent, setEnContent] = useState(en_sub_description ? en_sub_description : "");
	const { toast } = useToast();

	;
	const handleEnContentChange = (event, editor) => {
		const data = editor.getData();
		setEnContent(data);
	}
	const handleFiContentChange = (event, editor) => {
		const data = editor.getData();
		setFiContent(data);
	};

	const handleSave = async () => {
		if (recordExists === false) {
			const { error } = await createDocument("main_db", "client_data", {
				body: {
					users: user.$id,
					fi_sub_description: fiContent,
					en_sub_description: enContent
				}
			})

			if (error) {
				toast({
					variant: "supabaseError",
					description: "Tuntematon virhe tiedon tallentamisessa."
				})
				return;
			}

			toast({
				variant: "success",
				title: "Tieto",
				description: "Tiedon tallentaminen onnistui."
			})
		} else {
			const { error } = await updateDocument("main_db", "client_data", user.clientData.$id, {
				fi_sub_description: fiContent,
				en_sub_description: enContent
			})

			if (error) {
				toast({
					variant: "supabaseError",
					description: "Tuntematon virhe tiedon päivittämisessa."
				})
				return;
			}

			toast({
				variant: "success",
				title: "Tieto",
				description: "Tiedon päivittäminen onnistui."
			})
		}
	};

	return (
		<div className='w-full'>
			<div className='w-full mr-5'>
				<h1 className='font-semibold'>Lisätietoja</h1>
				<p className='text-zinc-600 leading-tight'>Lisätiedot näkyvät tapahtuman etusivulla, voit lisätä siihen jotain tilapäistä ohjeistusta tms. Osallistujille.</p>
			</div>
			<div className="w-full mt-5">
				<div className='flex max-lg:flex-wrap w-full'>
					<div className='max-w-[50%] max-lg:max-w-full flex-1 w-full mr-3 max-lg:mb-2 min-h-[190px]'>
						<h3 className='font-medium'>FI</h3>
						<CKeditor content={fi_sub_description} handleChange={handleFiContentChange} />
					</div>
					<div className='max-w-[50%] max-lg:max-w-full max-lg:ml-0  flex-1 w-full ml-3 min-h-[190px]'>
						<h3 className='font-medium'>EN</h3>
						<CKeditor content={en_sub_description} handleChange={handleEnContentChange} />
					</div>
				</div>
				<Button
					onClick={handleSave}
					className="bg-orange-400 hover:bg-orange-500 mt-2"
				>
					Tallenna
				</Button>
			</div>
		</div>
	);
}

export default SettingsOtherForm;
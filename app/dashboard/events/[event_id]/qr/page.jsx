"use client";

import { useOrigin } from '@/hooks/use-origin';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from "@/components/ui/card";

export default function Page() {
    const { event_id } = useParams();
    const origin = useOrigin();

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <Card className="w-full max-w-sm p-6">
                <div className="flex flex-col items-center space-y-6">
                    <h1 className="text-2xl font-bold text-center">QR-koodi</h1>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <QRCodeCanvas
                            id="qr-code"
                            value={`${origin}/register-for-event/${event_id}`}
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                        />
                    </div>

                    <p className="text-xs text-muted-foreground text-center break-all">
                        {`${origin}/register-for-event/${event_id}`}
                    </p>
                </div>
            </Card>
        </div>
    );
};

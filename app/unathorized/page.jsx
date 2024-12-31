'use client';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-orange-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-red-500">
            Et ole kirjautunut sisään
          </h1>
          <p className="text-lg text-red-500">
            Yritä rekisteröityä tapahtumaan uudelleen saamastasi linkistä. Jos ongelma jatkuu, ota yhteyttä järjestäjään.
          </p>
        </div>
      </div>
    </div>
  );
}
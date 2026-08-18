import { Button } from "@/components/ui/button";
import type { Pet } from "@/types/pet";

interface PetIDCardTabProps {
  petId: string;
  pet: Pet;
}

// Simple QR code SVG generator (basic implementation)
// In production, you'd use a library like qrcode.react or qr-code-js
function generateQRCodeSVG(text: string): string {
  // This is a placeholder - in production, use a proper QR code library
  // For now, we'll just display a message to implement this
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='white'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='12' fill='black'%3EQR Code%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='10' fill='gray'%3E${text}%3C/text%3E%3C/svg%3E`;
}

export default function PetIDCardTab({ petId, pet }: PetIDCardTabProps) {
  const qrText = `Pet ID: ${petId}`;
  const qrImage = generateQRCodeSVG(qrText);

  const handleDownloadCard = () => {
    // This would generate a PDF or image of the ID card
    alert("Download functionality would be implemented here");
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button onClick={handleDownloadCard} variant="outline">
          Download Card
        </Button>
        <Button onClick={handlePrintCard} variant="outline">
          Print Card
        </Button>
      </div>

      {/* ID Card */}
      <div className="mx-auto max-w-md">
        <div
          className="rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 p-8 shadow-lg"
          id="pet-id-card"
        >
          {/* Card Header */}
          <div className="mb-6 border-b-2 border-primary-200 pb-4 text-center">
            <h3 className="text-sm font-bold uppercase text-primary-700">
              Digital Pet ID Card
            </h3>
          </div>

          {/* Pet Photo */}
          {pet.photo_url && (
            <div className="mb-4 flex justify-center">
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
              />
            </div>
          )}

          {/* Pet Info */}
          <div className="mb-6 space-y-3 text-center">
            <div>
              <p className="text-sm font-medium text-primary-600">Pet Name</p>
              <p className="text-2xl font-bold text-slate-900">{pet.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-primary-600">Species</p>
                <p className="text-sm font-semibold text-slate-900">
                  {pet.species}
                </p>
              </div>
              {pet.breed && (
                <div>
                  <p className="text-xs font-medium text-primary-600">Breed</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {pet.breed}
                  </p>
                </div>
              )}
            </div>

            {pet.gender && (
              <div>
                <p className="text-xs font-medium text-primary-600">Gender</p>
                <p className="text-sm font-semibold text-slate-900">
                  {pet.gender}
                </p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="mb-6 flex justify-center rounded-lg bg-white p-4">
            <div className="h-32 w-32">
              <img
                src={qrImage}
                alt="QR Code"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Pet ID */}
          <div className="mb-4 rounded-lg bg-white bg-opacity-50 p-3 text-center">
            <p className="text-xs font-medium text-primary-600">Pet ID</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900">
              {petId}
            </p>
          </div>

          {/* Microchip Number */}
          {pet.microchip_number && (
            <div className="rounded-lg bg-white bg-opacity-50 p-3 text-center">
              <p className="text-xs font-medium text-primary-600">Microchip</p>
              <p className="mt-1 font-mono text-sm text-slate-900">
                {pet.microchip_number}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 border-t-2 border-primary-200 pt-4 text-center">
            <p className="text-xs text-primary-700">
              Scan QR code to view pet details online
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">How to use this ID Card:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Download or print this digital ID card</li>
          <li>Keep it with your pet or in your wallet</li>
          <li>Scan the QR code with a smartphone to view pet details</li>
          <li>Share with veterinarians or emergency contacts</li>
        </ul>
      </div>
    </div>
  );
}

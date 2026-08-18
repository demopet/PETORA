import { useState, useEffect } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import type { Pet } from "@/types/pet";

interface PetIDCardTabProps {
  petId: string;
  pet: Pet;
}

export default function PetIDCardTab({ petId, pet }: PetIDCardTabProps) {
  const [qrImage, setQrImage] = useState<string>("");
  const qrText = `${window.location.origin}/portal/pets/${petId}`;

  useEffect(() => {
    QRCode.toDataURL(qrText, {
      width: 200,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).then(setQrImage);
  }, [qrText]);

  const handleDownloadCard = async () => {
    const cardElement = document.getElementById("pet-id-card");
    if (!cardElement) return;

    const canvas = await html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `${pet.name.replace(/\s+/g, "_")}_ID_Card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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
            <h3 className="text-sm font-bold uppercase text-primary-700">Digital Pet ID Card</h3>
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
                <p className="text-sm font-semibold text-slate-900">{pet.species}</p>
              </div>
              {pet.breed && (
                <div>
                  <p className="text-xs font-medium text-primary-600">Breed</p>
                  <p className="text-sm font-semibold text-slate-900">{pet.breed}</p>
                </div>
              )}
            </div>

            {pet.gender && (
              <div>
                <p className="text-xs font-medium text-primary-600">Gender</p>
                <p className="text-sm font-semibold text-slate-900">{pet.gender}</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="mb-6 flex justify-center rounded-lg bg-white p-4">
            <div className="h-32 w-32">
              {qrImage && (
                <img src={qrImage} alt="QR Code" className="h-full w-full object-contain" />
              )}
            </div>
          </div>

          {/* Pet ID */}
          <div className="mb-4 rounded-lg bg-white bg-opacity-50 p-3 text-center">
            <p className="text-xs font-medium text-primary-600">Pet ID</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900">{petId}</p>
          </div>

          {/* Microchip Number */}
          {pet.microchip_number && (
            <div className="rounded-lg bg-white bg-opacity-50 p-3 text-center">
              <p className="text-xs font-medium text-primary-600">Microchip</p>
              <p className="mt-1 font-mono text-sm text-slate-900">{pet.microchip_number}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 border-t-2 border-primary-200 pt-4 text-center">
            <p className="text-xs text-primary-700">Scan QR code to view pet details online</p>
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

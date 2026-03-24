import { PitchDeck } from "@/components/pitch/PitchDeck";

export const metadata = {
  title: "BitPay Pitch Deck | Stacks Hackathon Presentation",
  description: "Bitcoin streaming and vesting vaults - Netflix for Money, secured by Bitcoin",
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-white">
      <PitchDeck />
    </div>
  );
}

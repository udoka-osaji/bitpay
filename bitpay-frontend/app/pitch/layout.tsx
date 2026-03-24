import "./pitch.css";

export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pitch-layout w-screen h-screen overflow-hidden">
      {children}
    </div>
  );
}

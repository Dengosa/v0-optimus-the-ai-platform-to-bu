import { ActivateBox } from "./ActivateBox";

export default function ActivatePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f7f7f5]">
      <div className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,#d8c4f0_0%,#c4d8f0_40%,transparent_70%)] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,#f0d8c4_0%,transparent_70%)] blur-3xl opacity-50" />
      <div className="relative w-full max-w-lg mx-auto px-6 py-20">
        <ActivateBox />
      </div>
    </main>
  );
}

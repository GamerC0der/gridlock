import { Sixtyfour } from "next/font/google";

const sixtyfour = Sixtyfour({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <h1 className={`${sixtyfour.className} text-white text-7xl font-bold`}>GridLock</h1>
    </div>
  );
}

import HomePage from "./HomePage/page";
import "./globals.css";

export default function Home() {
  return (
    // Background utama diubah menjadi abu-abu sangat terang agar kontras dengan card putih
    <main className="flex min-h-screen w-full max-w-lg justify-center mx-auto bg-gray-50 shadow-2xl relative overflow-x-hidden">
      <HomePage />
    </main>
  );
}
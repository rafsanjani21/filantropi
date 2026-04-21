import { ArrowRight, UserCircle, Users } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-lg mx-auto flex flex-col bg-linear-to-b from-[#FFFFFF] to-[#E5AFE7]  items-center">
      <div className="w-full max-w-md flex flex-col mt-20 mx-auto px-4">
        <h1 className="text-3xl text-purple-700 font-bold mb-6 text-center">
          Login
        </h1>

        <img
          src="/logo.png"
          alt="Login Illustration"
          className="w-[221px] h-auto mb-6 justify-center items-center mx-auto"
        />

        <a
          href="/LoginPage/Masuk"
          className="group flex items-center justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-300 hover:bg-purple-500 hover:shadow-lg hover:-translate-y-1 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-400 transition-colors">
              <UserCircle className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <span className="font-semibold text-purple-700 group-hover:text-white transition-colors">
              Penerima Manfaat
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-purple-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </a>

        <a
          href="/LoginPage/Masuk"
          className="group flex items-center justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-300 hover:bg-purple-500 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-400 transition-colors">
              <Users className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <span className="font-semibold text-purple-700 group-hover:text-white transition-colors">
              Pengguna Umum
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-purple-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </a>
      </div>
    </div>
  );
}

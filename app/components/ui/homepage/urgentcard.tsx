import Link from "next/link";

type UrgentCardProps = {
  image: string;
  foundation: string;
  title: string;
  collected: string;
  target: string;
  progress: number;
};

export default function UrgentCard({
  image,
  foundation,
  title,
  collected,
  target,
  progress,
}: UrgentCardProps) {
  return (
    <Link href="/DetailPage">
      <div className="min-w-[85%] md:min-w-95 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0 cursor-pointer hover:bg-gray-100 transition">
        
        <img
          src={image}
          alt={title}
          className="w-full h-52 object-cover"
        />

        <div className="p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>{foundation}</span>
            <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
          </div>

          <h3 className="mt-3 text-lg font-bold">{title}</h3>

          <div className="mt-12">
            <div className="flex justify-between text-sm font-bold">
              <span>{collected}</span>
              <span>{target}</span>
            </div>

            <div className="mt-3 w-full h-3 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-700 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
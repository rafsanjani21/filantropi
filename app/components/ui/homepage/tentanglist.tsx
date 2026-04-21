import TentangCard from "./tentangcard";

export default function TentangList() {
  const articles = [
    {
      title: "Tentang Filantropi",
      description: "Filantropi bukan tentang seberapa besar nominal yang kita berikan, tapi tentang seberapa besar perubahan yang kita ciptakan bersama.",
      link: "#"
    },
    {
      title: "Tentang Filantropi",
      description: "Filantropi bukan tentang seberapa besar nominal yang kita berikan, tapi tentang seberapa besar perubahan yang kita ciptakan bersama.",
      link: "#"
    },
    {
      title: "Tentang Filantropi",
      description: "Filantropi bukan tentang seberapa besar nominal yang kita berikan, tapi tentang seberapa besar perubahan yang kita ciptakan bersama.",
      link: "#"
    }
  ];

  return (
    <main className="max-w-4xl mx-auto bg-white">
      {/* Garis ungu di bagian paling atas sesuai gambar */}
      <div className="h-2 w-full bg-purple-200 mb-4"></div>
      
      <div className="flex flex-col mx-4">
        {articles.map((item, index) => (
          <TentangCard
            key={index}
            title={item.title}
            description={item.description}
            link={item.link}
          />
        ))}
      </div>
    </main>
  );
}
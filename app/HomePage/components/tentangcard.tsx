import React from 'react';
import { ChevronRight } from 'lucide-react'; 

interface CardProps {
  title: string;
  description: string;
  link: string;
}

const TentangCard = ({ title, description, link }: CardProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between py-4 border-b border-gray-200 gap-6">
      {/* Konten Teks */}
      <div className="flex-1 space-y-3">
        <h2 className="font-bold text-gray-900">
          {title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
          {description}
        </p>
        <a 
          href={link} 
          className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors text-sm"
        >
          Baca selengkapnya 
          <ChevronRight className="ml-1 w-4 h-4" />
        </a>
      </div>

      {/* Placeholder Gambar */}
      <div className="w-55 h-40 bg-gray-300 rounded-2xl shrink-0">
      </div>
    </div>
  );
};

export default TentangCard;
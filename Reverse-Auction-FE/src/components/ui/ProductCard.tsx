import React from "react";
import { Cpu } from "lucide-react";

interface ProductCardProps {
  name: string;
  price: string;
  image?: string;
  rating?: number;
  sold?: number;
  status?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  name, 
  price, 
  image, 
  rating = 5.0, 
  sold = 0,
  status = "Sẵn hàng"
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
      <div className="relative aspect-square bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Cpu className="w-24 h-24 text-slate-300 group-hover:text-primary-300 group-hover:scale-110 transition-all duration-500" />
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {status}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center space-x-1 mb-2">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>
          <span className="text-sm text-slate-400">({sold} đã bán)</span>
        </div>
        
        <h3 className="font-medium text-slate-800 line-clamp-2 mb-3 flex-grow group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
        
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-xs text-slate-500 mb-1">Giá tham khảo</p>
            <p className="text-lg font-bold text-primary-700">{price}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";


interface CategoryCardProps {
  title: string;
  icon: React.ElementType;
  description?: string;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon: Icon, description, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer duration-300 transform hover:-translate-y-1"
    >
      <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-slate-800 font-semibold text-center group-hover:text-primary-700 transition-colors">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {description}
        </p>
      )}
    </div>
  );
};

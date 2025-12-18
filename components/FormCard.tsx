
import React from 'react';

interface FormCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FormCard: React.FC<FormCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default FormCard;

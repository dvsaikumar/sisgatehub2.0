import React from 'react';
import { Link } from 'react-router-dom';

interface ActionCardProps {
    to: string;
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    isCompact?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ to, label, icon: Icon, color, bg, isCompact = false }) => {
    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center ${isCompact ? 'p-3 rounded-xl' : 'p-6 rounded-2xl'} bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group h-full no-underline`}
        >
            <div
                className={`${isCompact ? 'w-10 h-10 rounded-lg mb-2' : 'w-14 h-14 rounded-2xl mb-3'} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                style={{ backgroundColor: bg, color: color }}
            >
                <Icon size={isCompact ? 20 : 28} weight="duotone" />
            </div>
            <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-slate-700 text-center group-hover:text-blue-600 transition-colors`}>
                {label}
            </span>
        </Link>
    );
};

export default ActionCard;

import React from 'react';

interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative mb-6 group">
                {/* Decorative blob background */}
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-indigo-50/50">
                    <Icon size={48} className="text-indigo-500/80" weight="duotone" />
                </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                {description}
            </p>
            {action}
        </div>
    );
};

export default EmptyState;

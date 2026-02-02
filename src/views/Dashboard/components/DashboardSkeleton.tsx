import React from 'react';

export const StatCardSkeleton: React.FC = () => (
    <div className="flex-1 p-4 md:px-6 flex justify-between items-center h-full border-r border-slate-100 last:border-r-0">
        <div className="w-full">
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse mb-3" />
            <div className="h-7 w-24 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 animate-pulse" />
    </div>
);

interface ListSkeletonProps {
    count?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 3 }) => (
    <div className="divide-y divide-slate-50">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-slate-50 rounded animate-pulse" />
                </div>
            </div>
        ))}
    </div>
);

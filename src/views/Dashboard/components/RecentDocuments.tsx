import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from '../../../lib/dayjs';
import { FileText, ArrowRight, Plus } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import EmptyState from './EmptyState.tsx';
import { ListSkeleton } from './DashboardSkeleton.tsx';
import { Document } from '../../../models';

interface RecentDocumentsProps {
    documents: Document[];
    loading: boolean;
    itemVariants: any;
}

const RecentDocuments: React.FC<RecentDocumentsProps> = ({ documents, loading, itemVariants }) => {
    return (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <FileText size={18} weight="duotone" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-base">Recent Documents</h4>
                        <p className="text-xs text-slate-400 font-medium">Updated recently</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/apps/ai/create-doc" className="text-slate-400 hover:text-rose-500 transition-colors">
                        <Plus size={18} weight="bold" />
                    </Link>
                    <Link to="/library" className="text-slate-400 hover:text-rose-500 transition-colors">
                        <ArrowRight size={18} weight="bold" />
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4">
                {loading ? (
                    <div className="p-2"><ListSkeleton count={4} /></div>
                ) : documents.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No documents"
                        description="Start creating."
                        action={
                            <Link to="/apps/ai/create-doc" className="btn btn-sm btn-primary">
                                <Plus className="mr-1" /> Create
                            </Link>
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:border-rose-100 hover:shadow-md hover:shadow-rose-100/50 transition-all duration-300 cursor-pointer group bg-white flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                    <FileText size={20} weight="duotone" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-slate-800 text-sm truncate group-hover:text-rose-600 transition-colors mb-1">{doc.name}</h5>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {doc.type}
                                        </span>
                                        <span className="text-[10px] text-slate-300">•</span>
                                        <span className="text-[10px] text-slate-400">{dayjs(doc.created_at).fromNow()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RecentDocuments;

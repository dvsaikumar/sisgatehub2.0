import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditService } from '../../../services/AuditService';
import { AuditLog } from '../../../models';
import dayjs from '../../../lib/dayjs';
import {
    Clock,
    User,
    FilePlus,
    SignIn,
    Trash,
    Eye,
    ListMagnifyingGlass
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const ActionIcon = ({ action }: { action: string }) => {
    switch (action) {
        case 'CREATE':
        case 'CREATE_DOC': return <FilePlus className="text-emerald-500" weight="duotone" />;
        case 'LOGIN': return <SignIn className="text-blue-500" weight="duotone" />;
        case 'DELETE': return <Trash className="text-red-500" weight="duotone" />;
        case 'VIEW':
        case 'VIEW_PAGE': return <Eye className="text-slate-400" weight="duotone" />;
        case 'SEARCH': return <ListMagnifyingGlass className="text-slate-400" weight="duotone" />;
        default: return <Clock className="text-slate-400" weight="duotone" />;
    }
};

const RecentActivity: React.FC = () => {
    const { data: logs } = useQuery({
        queryKey: ['recentActivity'],
        queryFn: () => AuditService.fetchLogs({ page: 0, pageSize: 8 }),
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <Clock size={18} weight="duotone" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-base">Activity</h4>
                        <p className="text-xs text-slate-400 font-medium">Real-time logs</p>
                    </div>
                </div>
                <Link to="/audit-logs" className="text-slate-400 hover:text-emerald-500 transition-colors">
                    <ListMagnifyingGlass size={18} weight="bold" />
                </Link>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4">
                {!logs ? (
                    <div className="p-2 space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                    </div>
                ) : logs.data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center pb-8">
                        <div className="w-20 h-20 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center mb-4">
                            <Clock size={32} className="text-emerald-500" weight="duotone" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-1">No Activity</h4>
                        <p className="text-sm text-slate-400">System is quiet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.data.map((log: AuditLog) => (
                            <div key={log.id} className="p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100 flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                    <ActionIcon action={log.action_type} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-600 transition-colors">
                                            {log.action_type.replace('_', ' ')}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                            {dayjs(log.created_at).format('HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-0.5" title={log.resource_name || ''}>
                                        {log.resource_name || 'System Event'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;

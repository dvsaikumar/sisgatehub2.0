import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from '../../../lib/dayjs';
import { Bell, CalendarCheck, Clock } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { ListSkeleton } from './DashboardSkeleton.tsx';
import { Reminder } from '../../../models';

interface UpcomingRemindersProps {
    reminders: Reminder[];
    loading: boolean;
    itemVariants: any;
}

const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({ reminders, loading, itemVariants }) => {
    return (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Bell size={18} weight="duotone" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-base">Reminders</h4>
                        <p className="text-xs text-slate-400 font-medium">Upcoming events</p>
                    </div>
                </div>
                <Link to="/reminders" className="text-slate-400 hover:text-orange-500 transition-colors">
                    <CalendarCheck size={18} weight="bold" />
                </Link>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4">
                {loading ? (
                    <div className="p-2"><ListSkeleton count={3} /></div>
                ) : reminders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center pb-8">
                        <div className="w-20 h-20 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center mb-4">
                            <Bell size={32} className="text-rose-500" weight="duotone" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-1">No reminders</h4>
                        <p className="text-sm text-slate-400">All caught up.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reminders.map((reminder, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:border-orange-100 hover:shadow-md hover:shadow-orange-100/50 transition-all duration-300 cursor-pointer group bg-white">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">{reminder.title}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium bg-slate-50 inline-flex px-2 py-1 rounded-md">
                                            <Clock size={12} weight="bold" className="text-orange-400" />
                                            {dayjs(reminder.schedule_at).format('MMM D, h:mm A')}
                                        </p>
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

export default UpcomingReminders;

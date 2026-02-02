import React from 'react';
import classNames from 'classnames';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bg: string;
    trend?: string;
    trendIcon?: React.ElementType;
    trendColor?: string;
    chartData?: number[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bg, trend, trendIcon: TrendIcon, trendColor }) => {
    return (
        <div className="flex-1 p-5 flex flex-col justify-between group transition-all duration-300 hover:bg-slate-50/50">
            <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
                <div className={classNames(`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110`, bg, color)}>
                    <Icon size={20} weight="duotone" />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</h2>
                {(trend && TrendIcon) && (
                    <div className="flex items-center gap-2">
                        <span className={classNames("flex items-center gap-1 text-xs font-extrabold", trendColor)}>
                            <TrendIcon weight="fill" />
                            {trend}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">vs last week</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;

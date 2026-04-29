import React from 'react';
import { Calendar, Mail, UserCheck, Users } from 'lucide-react';

// ──────────────────────────────────────────────
// StatCard (local, memoized)
// ──────────────────────────────────────────────

const StatCard = React.memo(({ icon: Icon, title, value, trend, progress, goal }: {
    icon: React.ElementType;
    title: string;
    value: string;
    trend: string;
    progress: number;
    goal: string;
}) => (
    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-5 flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-amber-200 text-amber-500 flex items-center justify-center bg-amber-50/50">
                    <Icon size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium mb-0.5">{title}</span>
                    <span className="text-2xl font-bold text-gray-900 leading-none">{value}</span>
                </div>
            </div>
            <div className="flex items-center text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                <span className="text-[10px] mr-1">▲</span> {trend}
            </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
            <div className="w-full bg-gray-200/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-400 font-medium">
                <span>{progress}% chỉ tiêu</span>
                <span>{goal}</span>
            </div>
        </div>
    </div>
));

StatCard.displayName = 'StatCard';

// ──────────────────────────────────────────────
// RecruitmentStats
// ──────────────────────────────────────────────

const RecruitmentStats = React.memo(() => (
    <div className="flex gap-4 mb-8 px-6 animate-in slide-in-from-top-2 fade-in duration-300">
        <StatCard icon={Users} title="Đã sàng lọc" value="1,248" trend="12%" progress={62} goal="2,000" />
        <StatCard icon={Calendar} title="Lịch phỏng vấn" value="320" trend="8%" progress={64} goal="500" />
        <StatCard icon={Mail} title="Đã gửi offer" value="94" trend="5%" progress={47} goal="200" />
        <StatCard icon={UserCheck} title="Đã tuyển" value="48" trend="20%" progress={60} goal="80" />
    </div>
));

RecruitmentStats.displayName = 'RecruitmentStats';

export default RecruitmentStats;

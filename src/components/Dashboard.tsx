import React from 'react';
import { Progress, Session } from '../types';
import { TrendingUp, Award, Calendar, Target, Clock, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

interface DashboardProps {
  progress: Progress;
  sessions: Session[];
}

export const Dashboard: React.FC<DashboardProps> = ({ progress, sessions }) => {
  const stats = [
    { label: 'Số lần thực hành', value: progress.totalAttempts, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Điểm trung bình', value: `${progress.averageScore.toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Chuỗi ngày học', value: `${progress.streakDays} ngày`, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Tỷ lệ hoàn thành', value: '92%', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Lịch sử thực hành gần đây
            </h3>
            <button className="text-sm text-emerald-600 font-medium hover:underline">Xem tất cả</button>
          </div>
          <div className="divide-y divide-slate-50">
            {sessions.length > 0 ? (
              sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {session.subjectId[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{session.subjectId}</h4>
                      <p className="text-xs text-slate-500">{dayjs(session.date).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className={`text-sm font-bold ${session.score >= 80 ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {session.score}%
                      </span>
                      <CheckCircle2 className={`w-4 h-4 ${session.score >= 80 ? 'text-emerald-600' : 'text-orange-600'}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {session.correctAnswers}/{session.totalQuestions} câu đúng
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                Chưa có dữ liệu thực hành. Hãy bắt đầu bài học đầu tiên!
              </div>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Chủ đề cần cải thiện
          </h3>
          <div className="space-y-4">
            {progress.weakTopics.map((topic) => (
              <div key={topic} className="group cursor-pointer">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">{topic}</span>
                  <span className="text-slate-400 text-xs">Cần ôn tập</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-400 rounded-full group-hover:bg-emerald-500 transition-all" 
                    style={{ width: `${Math.random() * 40 + 20}%` }}
                  />
                </div>
              </div>
            ))}
            {progress.weakTopics.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8 italic">
                Tuyệt vời! Bạn đang làm rất tốt tất cả các chủ đề.
              </p>
            )}
          </div>
          
          <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 text-sm mb-2">Gợi ý từ AI Tutor</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Dựa trên kết quả gần đây, bạn nên dành thêm 15 phút ôn tập về "Định luật Ohm" để củng cố kiến thức nền tảng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { generateSimulation } from '../services/geminiService';
import { Simulation } from '../types';
import { Wand2, Loader2, Sparkles, BookOpen, GraduationCap, Settings2, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface SimulationCreatorProps {
  onCreated: (simulation: Simulation) => void;
  selectedModel?: string;
}

export const SimulationCreator: React.FC<SimulationCreatorProps> = ({ onCreated, selectedModel }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Vật lý');
  const [grade, setGrade] = useState('Lớp 10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập chủ đề thí nghiệm!', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep('Đang phân tích chủ đề...');

    try {
      setCurrentStep('Đang tạo mô phỏng với AI...');
      const result = await generateSimulation(topic, subject, grade, selectedModel);
      
      const newSimulation: Simulation = {
        id: Date.now().toString(),
        title: topic,
        subjectId: subject,
        description: `Mô phỏng thí nghiệm ${topic} cho ${grade}`,
        htmlCode: result.html,
        parameters: result.parameters,
        practiceQuestions: result.practiceQuestions,
        teacherGuide: result.teacherGuide,
        createdAt: new Date().toISOString(),
      };

      setCurrentStep('Hoàn tất!');
      onCreated(newSimulation);
      Swal.fire('Thành công', 'Đã tạo mô phỏng thí nghiệm tương tác!', 'success');
      setTopic('');
    } catch (error: any) {
      console.error('Lỗi tạo mô phỏng:', error);
      // AI.md §3: Hiển thị nguyên văn lỗi từ API
      const errorMsg = error.message || 'Không thể tạo mô phỏng. Vui lòng thử lại!';
      setError(errorMsg);
      setCurrentStep('Đã dừng do lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
        <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <Wand2 className="w-8 h-8" />
          Tạo mô phỏng AI thông minh
        </h2>
        <p className="text-emerald-50 text-sm opacity-90">
          Nhập chủ đề bài học, AI sẽ tự động thiết kế mô hình thí nghiệm tương tác HTML5 chuẩn khoa học.
        </p>
        {selectedModel && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            Model: {selectedModel}
          </div>
        )}
      </div>

      <div className="p-8 space-y-8">
        {/* Error Display - AI.md §3 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-700 text-sm mb-1">Đã dừng do lỗi</h4>
              <p className="text-red-600 text-xs font-mono break-all">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Môn học
            </label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50"
            >
              <option>Vật lý</option>
              <option>Hóa học</option>
              <option>Sinh học</option>
              <option>Toán học</option>
              <option>Công nghệ</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Đối tượng lớp học
            </label>
            <select 
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50"
            >
              <option>Lớp 6</option>
              <option>Lớp 7</option>
              <option>Lớp 8</option>
              <option>Lớp 9</option>
              <option>Lớp 10</option>
              <option>Lớp 11</option>
              <option>Lớp 12</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-600" />
            Chủ đề chi tiết (Ví dụ: Định luật Ohm, Khúc xạ ánh sáng, Sự rơi tự do...)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Nhập tên thí nghiệm bạn muốn tạo..."
            className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 text-lg"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3 text-lg group"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {currentStep}
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Bắt đầu tạo mô phỏng
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-3 text-sm">Gợi ý từ AI:</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Định luật Ohm', 'Khúc xạ ánh sáng', 'Sự rơi tự do', 'Phản ứng trung hòa'].map(item => (
              <li 
                key={item}
                onClick={() => setTopic(item)}
                className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

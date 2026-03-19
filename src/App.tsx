import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Beaker, 
  Wand2, 
  Settings, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X, 
  ChevronRight, 
  Plus, 
  Database, 
  CloudUpload, 
  History, 
  GraduationCap, 
  BookOpen, 
  Atom, 
  FlaskConical, 
  Microscope, 
  Cpu, 
  Calculator,
  Key,
  Eye,
  EyeOff,
  Save,
  LogOut,
  ExternalLink,
  Zap,
  Check,
  Star,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, Question, Session, Progress, Settings as AppSettings, Simulation, AppData } from './types';
import { Dashboard } from './components/Dashboard';
import { SimulationCreator } from './components/SimulationCreator';
import { SimulationPlayer } from './components/SimulationPlayer';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Available AI Models - AI.md §1 & §2
const AI_MODELS = [
  { 
    id: 'gemini-3-flash-preview', 
    name: 'Gemini 3 Flash', 
    description: 'Nhanh, tiết kiệm quota', 
    badge: 'Default',
    icon: Zap,
    color: 'amber'
  },
  { 
    id: 'gemini-3-pro-preview', 
    name: 'Gemini 3 Pro', 
    description: 'Chất lượng cao, chi tiết', 
    badge: null,
    icon: Star,
    color: 'emerald'
  },
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    description: 'Ổn định, tin cậy', 
    badge: null,
    icon: Shield,
    color: 'blue'
  },
];

// Demo Data
const DEMO_SUBJECTS: Subject[] = [
  { id: 'physics', name: 'Vật lý', icon: 'Atom', questionsCount: 120 },
  { id: 'chemistry', name: 'Hóa học', icon: 'FlaskConical', questionsCount: 85 },
  { id: 'biology', name: 'Sinh học', icon: 'Microscope', questionsCount: 64 },
  { id: 'technology', name: 'Công nghệ', icon: 'Cpu', questionsCount: 42 },
  { id: 'math', name: 'Toán học', icon: 'Calculator', questionsCount: 150 },
];

const DEMO_SIMULATIONS: Simulation[] = [
  {
    id: '1',
    title: 'Định luật Ohm',
    subjectId: 'physics',
    description: 'Mô phỏng mối quan hệ giữa cường độ dòng điện, hiệu điện thế và điện trở.',
    htmlCode: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white; }
          .circuit { position: relative; width: 300px; height: 200px; border: 4px solid #475569; border-radius: 20px; }
          .resistor { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 30px; background: #f59e0b; border: 2px solid #b45309; display: flex; align-items: center; justify-content: center; font-weight: bold; color: black; }
          .electron { position: absolute; width: 8px; height: 8px; background: #38bdf8; border-radius: 50%; box-shadow: 0 0 10px #38bdf8; }
          .stats { margin-top: 20px; text-align: center; font-family: monospace; font-size: 1.2rem; }
          .label { color: #94a3b8; font-size: 0.8rem; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="circuit" id="circuit">
          <div class="resistor" id="resistorDisplay">R</div>
        </div>
        <div class="stats">
          <div><span class="label">Cường độ (I):</span> <span id="currentVal">0</span> A</div>
          <div><span class="label">Hiệu điện thế (U):</span> <span id="voltageVal">0</span> V</div>
          <div><span class="label">Điện trở (R):</span> <span id="resistanceVal">0</span> Ω</div>
        </div>
        <script>
          let electrons = [];
          const circuit = document.getElementById('circuit');
          const currentVal = document.getElementById('currentVal');
          const voltageVal = document.getElementById('voltageVal');
          const resistanceVal = document.getElementById('resistanceVal');
          
          function updateSimulation(params) {
            const { voltage, resistance } = params;
            const current = (voltage / resistance).toFixed(2);
            
            currentVal.innerText = current;
            voltageVal.innerText = voltage;
            resistanceVal.innerText = resistance;
            
            // Update electron flow
            const speed = current * 2;
            electrons.forEach(e => e.remove());
            electrons = [];
            
            const count = Math.min(Math.floor(current * 10), 50);
            for(let i=0; i<count; i++) {
              const e = document.createElement('div');
              e.className = 'electron';
              circuit.appendChild(e);
              electrons.push(e);
              animateElectron(e, Math.random() * 5, speed);
            }
          }

          function animateElectron(el, delay, speed) {
            let pos = 0;
            const path = [
              {x: 0, y: 0}, {x: 300, y: 0}, {x: 300, y: 200}, {x: 0, y: 200}, {x: 0, y: 0}
            ];
            
            function step() {
              pos += speed;
              if (pos > 1000) pos = 0;
              
              const segment = Math.floor(pos / 250);
              const t = (pos % 250) / 250;
              const p1 = path[segment];
              const p2 = path[segment + 1];
              
              const x = p1.x + (p2.x - p1.x) * t;
              const y = p1.y + (p2.y - p1.y) * t;
              
              el.style.left = (x - 4) + 'px';
              el.style.top = (y - 4) + 'px';
              
              requestAnimationFrame(step);
            }
            setTimeout(step, delay * 100);
          }
        </script>
      </body>
      </html>
    `,
    parameters: [
      { name: 'voltage', label: 'Hiệu điện thế (U)', min: 0, max: 24, step: 0.5, defaultValue: 12, unit: 'V' },
      { name: 'resistance', label: 'Điện trở (R)', min: 1, max: 100, step: 1, defaultValue: 10, unit: 'Ω' },
    ],
    createdAt: new Date().toISOString(),
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulations' | 'creator' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [appData, setAppData] = useState<AppData>({
    subjects: DEMO_SUBJECTS,
    questions: [],
    sessions: [
      { id: '1', subjectId: 'Vật lý', score: 85, totalQuestions: 20, correctAnswers: 17, timeSpent: 1200, date: new Date().toISOString() },
      { id: '2', subjectId: 'Hóa học', score: 70, totalQuestions: 10, correctAnswers: 7, timeSpent: 600, date: new Date(Date.now() - 86400000).toISOString() },
    ],
    progress: { totalAttempts: 12, averageScore: 78.5, streakDays: 5, weakTopics: ['Điện xoay chiều', 'Cân bằng phương trình', 'Di truyền học'] },
    settings: { theme: 'light', soundEnabled: true, autoSave: true, model: 'gemini-3-flash-preview' },
    simulations: DEMO_SIMULATIONS,
  });
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('gemini_api_key') || '');
  
  // AI.md §2: Modal bắt buộc nhập API Key
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('selected_model') || 'gemini-3-flash-preview');

  // Check API Key on mount - AI.md §2
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKeyInput(savedKey);
    } else {
      setShowApiKeyModal(true);
    }
    const savedModel = localStorage.getItem('selected_model');
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  const saveApiKey = (fromModal = false) => {
    if (!apiKeyInput.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập API Key!', 'error');
      return;
    }
    localStorage.setItem('gemini_api_key', apiKeyInput);
    if (fromModal) {
      setShowApiKeyModal(false);
    }
    Swal.fire('Thành công', 'Đã lưu API Key!', 'success');
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('selected_model', modelId);
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, model: modelId }
    }));
  };

  const handleCreateSimulation = (sim: Simulation) => {
    setAppData(prev => ({
      ...prev,
      simulations: [sim, ...prev.simulations]
    }));
    setSelectedSimulation(sim);
    setActiveTab('simulations');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'experiment_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'simulations', label: 'Thư viện mô phỏng', icon: Beaker },
    { id: 'creator', label: 'Tạo bằng AI', icon: Wand2 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = { Atom, FlaskConical, Microscope, Cpu, Calculator };
    const Icon = icons[iconName] || BookOpen;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-['Be_Vietnam_Pro'] text-slate-900 overflow-hidden">
      
      {/* ===== API Key Modal (AI.md §2) ===== */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Chào mừng đến AI Lab!</h2>
                <p className="text-emerald-50 text-sm">Bạn cần nhập API Key để sử dụng ứng dụng</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-amber-800 text-sm font-medium mb-2">📌 Hướng dẫn lấy API Key:</p>
                  <ol className="text-amber-700 text-xs space-y-1 list-decimal pl-4">
                    <li>Truy cập Google AI Studio</li>
                    <li>Đăng nhập tài khoản Google</li>
                    <li>Tạo API Key mới hoặc sao chép key hiện có</li>
                    <li>Dán vào ô bên dưới</li>
                  </ol>
                  <a 
                    href="https://aistudio.google.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-bold text-xs underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Mở Google AI Studio để lấy key
                  </a>
                </div>

                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Dán API Key vào đây..."
                    className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && saveApiKey(true)}
                  />
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button 
                  onClick={() => saveApiKey(true)}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <Save className="w-5 h-5" />
                  Lưu và bắt đầu sử dụng
                </button>

                <p className="text-[10px] text-slate-400 italic text-center">
                  * API Key được lưu trữ an toàn trong LocalStorage của trình duyệt này.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col z-30"
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
              <h1 className="font-bold text-slate-800 leading-tight">Thầy Hiếu</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">AI Lab</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (item.id !== 'simulations') setSelectedSimulation(null);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative",
                activeTab === item.id 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-emerald-600" : "group-hover:scale-110 transition-transform")} />
              {isSidebarOpen && <span>{item.label}</span>}
              {activeTab === item.id && (
                <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-emerald-600 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm bài giảng, thí nghiệm..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* AI.md §2: Nút Settings (API Key) trên Header với dòng chữ đỏ */}
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group"
              title="Cài đặt API Key"
            >
              <Key className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-bold text-red-500 hidden sm:inline">Lấy API key để sử dụng app</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">Online</span>
            </div>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1" />

            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Nguyễn Minh Hiếu</p>
                <p className="text-[10px] text-slate-500 font-medium">Giáo viên Vật lý</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Chào buổi sáng, Thầy Hiếu! 👋</h2>
                  <p className="text-slate-500">Hôm nay bạn có 3 lớp học và 1 thí nghiệm mới cần chuẩn bị.</p>
                </div>
                
                <Dashboard progress={appData.progress} sessions={appData.sessions} />

                <div className="mt-12">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Môn học của bạn
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {appData.subjects.map((subject) => (
                      <div key={subject.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                          <div className="text-slate-600 group-hover:text-emerald-600 transition-colors">
                            {getIconComponent(subject.icon)}
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{subject.name}</h4>
                        <p className="text-xs text-slate-500">{subject.questionsCount} bài học</p>
                        <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Chi tiết <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-all cursor-pointer">
                      <Plus className="w-8 h-8 mb-2" />
                      <span className="text-sm font-bold">Thêm môn</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'simulations' && (
              <motion.div 
                key="simulations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col"
              >
                {selectedSimulation ? (
                  <div className="flex-1 flex flex-col">
                    <button 
                      onClick={() => setSelectedSimulation(null)}
                      className="mb-6 text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-2 font-medium"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Quay lại thư viện
                    </button>
                    <div className="flex-1 min-h-0">
                      <SimulationPlayer simulation={selectedSimulation} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Thư viện mô phỏng</h2>
                        <p className="text-slate-500">Khám phá và sử dụng các mô hình thí nghiệm tương tác.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('creator')}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                      >
                        <Plus className="w-5 h-5" />
                        Tạo mới
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {appData.simulations.map((sim) => (
                        <div 
                          key={sim.id} 
                          onClick={() => setSelectedSimulation(sim)}
                          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                        >
                          <div className="h-48 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                            <div className="z-20 text-white text-center p-6">
                              <Beaker className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                              <h4 className="font-bold text-lg">{sim.title}</h4>
                            </div>
                            <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                              {sim.subjectId}
                            </div>
                          </div>
                          <div className="p-6">
                            <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                              {sim.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-medium">
                                {new Date(sim.createdAt).toLocaleDateString()}
                              </span>
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                                  <CloudUpload className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                                  <History className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'creator' && (
              <motion.div 
                key="creator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="mb-8 text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">AI Experiment Lab</h2>
                  <p className="text-slate-500">Sử dụng sức mạnh của Gemini AI để tạo ra các thí nghiệm tương tác chỉ trong vài giây.</p>
                </div>
                <SimulationCreator onCreated={handleCreateSimulation} selectedModel={selectedModel} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-3xl font-bold text-slate-800 mb-8">Cài đặt hệ thống</h2>
                
                <div className="space-y-8">
                  {/* AI.md §2: Model Selector Cards */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-emerald-50 rounded-2xl">
                        <Wand2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Thiết lập Model AI</h3>
                        <p className="text-xs text-slate-500">Chọn model AI phù hợp với nhu cầu của bạn.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(model.id)}
                          className={cn(
                            "relative p-6 rounded-2xl border-2 text-left transition-all group",
                            selectedModel === model.id 
                              ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100" 
                              : "border-slate-100 hover:border-slate-300 hover:shadow-md"
                          )}
                        >
                          {/* Selected checkmark */}
                          {selectedModel === model.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          {/* Badge */}
                          {model.badge && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-3">
                              {model.badge}
                            </span>
                          )}

                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                            model.color === 'amber' && "bg-amber-100",
                            model.color === 'emerald' && "bg-emerald-100",
                            model.color === 'blue' && "bg-blue-100",
                          )}>
                            <model.icon className={cn(
                              "w-6 h-6",
                              model.color === 'amber' && "text-amber-600",
                              model.color === 'emerald' && "text-emerald-600",
                              model.color === 'blue' && "text-blue-600",
                            )} />
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm mb-1">{model.name}</h4>
                          <p className="text-[10px] text-slate-500">{model.description}</p>
                          <p className="text-[9px] text-slate-400 mt-2 font-mono truncate">{model.id}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Key Section */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-amber-50 rounded-2xl">
                        <Key className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Cấu hình Gemini AI</h3>
                        <p className="text-xs text-slate-500">Cần thiết để sử dụng tính năng tạo thí nghiệm bằng AI.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type={showApiKey ? "text" : "password"}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder="Nhập Gemini API Key của bạn..."
                          className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                        <button 
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => saveApiKey(false)}
                          className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          Lưu API Key
                        </button>
                        {/* AI.md §2: Link đúng */}
                        <a 
                          href="https://aistudio.google.com/api-keys" 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Lấy Key mới
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        * API Key được lưu trữ an toàn trong LocalStorage của trình duyệt này.
                      </p>
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-blue-50 rounded-2xl">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Quản lý dữ liệu</h3>
                        <p className="text-xs text-slate-500">Sao lưu và phục hồi dữ liệu bài giảng của bạn.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={exportData}
                        className="p-6 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                      >
                        <CloudUpload className="w-8 h-8 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-slate-800 mb-1">Xuất dữ liệu</h4>
                        <p className="text-xs text-slate-500">Tải về toàn bộ thư viện và tiến độ dưới dạng tệp JSON.</p>
                      </button>
                      <button className="p-6 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group">
                        <History className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-slate-800 mb-1">Nhập dữ liệu</h4>
                        <p className="text-xs text-slate-500">Tải lên tệp sao lưu để khôi phục trạng thái ứng dụng.</p>
                      </button>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="flex justify-center pt-4">
                    <button className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-6 py-3 rounded-xl transition-colors">
                      <LogOut className="w-5 h-5" />
                      Đăng xuất khỏi hệ thống
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

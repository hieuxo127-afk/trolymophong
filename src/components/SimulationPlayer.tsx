import React, { useEffect, useRef, useState } from 'react';
import { Simulation, SimulationParameter } from '../types';
import { 
  Sliders, Play, RotateCcw, Download, Code, Maximize2, 
  HelpCircle, BookOpenCheck, Lightbulb, Target, CheckCircle2, 
  XCircle, ChevronDown, ChevronUp, FileDown 
} from 'lucide-react';

interface SimulationPlayerProps {
  simulation: Simulation;
}

export const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ simulation }) => {
  const [params, setParams] = useState<{ [key: string]: number }>(
    Object.fromEntries(simulation.parameters.map(p => [p.name, p.defaultValue]))
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | null }>({});
  const [showExplanations, setShowExplanations] = useState<{ [key: number]: boolean }>({});
  const [expandGuide, setExpandGuide] = useState(true);

  const updateParam = (name: string, value: number) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_PARAMS', params }, '*');
    }
  }, [params]);

  const handleReset = () => {
    setParams(Object.fromEntries(simulation.parameters.map(p => [p.name, p.defaultValue])));
  };

  const downloadHtml = () => {
    // Tạo file HTML tự chứa (self-contained) với các thanh trượt thông số
    const paramSliders = simulation.parameters.map(p => `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <label style="font-size:13px;font-weight:600;color:#334155">${p.label}</label>
          <span id="val_${p.name}" style="font-size:13px;font-weight:700;color:#059669">${p.defaultValue} ${p.unit}</span>
        </div>
        <input type="range" id="slider_${p.name}" 
          min="${p.min}" max="${p.max}" step="${p.step}" value="${p.defaultValue}"
          style="width:100%;height:6px;border-radius:4px;outline:none;accent-color:#059669;cursor:pointer"
          oninput="onParamChange()" />
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:2px">
          <span>${p.min} ${p.unit}</span><span>${p.max} ${p.unit}</span>
        </div>
      </div>
    `).join('');

    const paramJS = simulation.parameters.map(p => 
      `params['${p.name}'] = parseFloat(document.getElementById('slider_${p.name}').value);
       document.getElementById('val_${p.name}').textContent = params['${p.name}'] + ' ${p.unit}';`
    ).join('\n        ');

    const defaultParamsJS = simulation.parameters.map(p => 
      `'${p.name}': ${p.defaultValue}`
    ).join(', ');

    const resetJS = simulation.parameters.map(p =>
      `document.getElementById('slider_${p.name}').value = ${p.defaultValue};`
    ).join('\n          ');

    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${simulation.title} - Thầy Hiếu AI Lab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #1e293b; }
    .app-header { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
    .app-header h1 { font-size: 18px; font-weight: 700; }
    .app-header .subtitle { font-size: 11px; opacity: 0.8; margin-top: 2px; }
    .app-layout { display: flex; gap: 0; min-height: calc(100vh - 56px); }
    .sim-area { flex: 1; background: #0f172a; position: relative; }
    .sim-area iframe { width: 100%; height: 100%; border: none; min-height: 500px; }
    .control-panel { width: 320px; background: white; border-left: 1px solid #e2e8f0; padding: 24px; overflow-y: auto; }
    .panel-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .panel-title svg { width: 16px; height: 16px; color: #059669; }
    .btn-reset { font-size: 11px; color: #059669; cursor: pointer; background: none; border: none; font-weight: 600; margin-left: auto; }
    .btn-reset:hover { text-decoration: underline; }
    .footer { background: #ecfdf5; border-top: 1px solid #a7f3d0; padding: 12px 24px; text-align: center; font-size: 11px; color: #059669; }
    @media (max-width: 768px) {
      .app-layout { flex-direction: column; }
      .control-panel { width: 100%; border-left: none; border-top: 1px solid #e2e8f0; }
      .sim-area iframe { min-height: 350px; }
    }
  </style>
</head>
<body>
  <div class="app-header">
    <div>
      <h1>🔬 ${simulation.title}</h1>
      <div class="subtitle">${simulation.description || simulation.subjectId}</div>
    </div>
  </div>
  <div class="app-layout">
    <div class="sim-area">
      <iframe id="simFrame"></iframe>
    </div>
    <div class="control-panel">
      <div class="panel-title">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
        Thông số thí nghiệm
        <button class="btn-reset" onclick="resetParams()">↺ Đặt lại</button>
      </div>
      ${paramSliders}
    </div>
  </div>
  <div class="footer">Được tạo bởi Thầy Hiếu AI Lab • Mô phỏng thí nghiệm tương tác</div>
` + '<scr' + 'ipt>' + `
    var simHtml = ${JSON.stringify(simulation.htmlCode)};
    
    // Inject message listener into simulation HTML
    var listenerScript = '<scr' + 'ipt>window.addEventListener("message", function(event) { if (event.data.type === "UPDATE_PARAMS" && typeof updateSimulation === "function") { updateSimulation(event.data.params); } });</' + 'scr' + 'ipt>';
    var enhancedHtml = simHtml + listenerScript;
    
    var iframe = document.getElementById('simFrame');
    iframe.srcdoc = enhancedHtml;

    function onParamChange() {
      var params = {};
      ${paramJS}
      iframe.contentWindow.postMessage({ type: 'UPDATE_PARAMS', params: params }, '*');
    }

    function resetParams() {
      ${resetJS}
      onParamChange();
    }

    // Initial update after iframe loads
    iframe.addEventListener('load', function() {
      var params = { ${defaultParamsJS} };
      iframe.contentWindow.postMessage({ type: 'UPDATE_PARAMS', params: params }, '*');
    });
` + '</' + 'scr' + 'ipt>' + `
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${simulation.title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe srcdoc="${simulation.htmlCode.replace(/"/g, '&quot;')}" width="100%" height="600px" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert('Đã sao chép mã nhúng!');
  };

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    setShowExplanations(prev => ({ ...prev, [qIndex]: true }));
  };

  // Inject a script into the HTML to listen for messages
  const enhancedHtml = `
    ${simulation.htmlCode}
    <script>
      window.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_PARAMS') {
          if (typeof updateSimulation === 'function') {
            updateSimulation(event.data.params);
          }
        }
      });
      // Initial call
      if (typeof updateSimulation === 'function') {
        updateSimulation(${JSON.stringify(params)});
      }
    </script>
  `;

  const questions = simulation.practiceQuestions || [];
  const guide = simulation.teacherGuide;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Simulation Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            {simulation.title}
          </h3>
          <div className="flex gap-2">
            <button onClick={downloadHtml} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600" title="Tải về HTML">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={copyEmbedCode} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600" title="Sao chép mã nhúng">
              <Code className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600" title="Toàn màn hình">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-900 min-h-[400px]">
          <iframe
            ref={iframeRef}
            srcDoc={enhancedHtml}
            className="w-full h-full border-none"
            title={simulation.title}
          />
        </div>

        {/* Download bar */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileDown className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Tải về mô phỏng</p>
              <p className="text-[10px] text-emerald-600">File HTML tự chạy, không cần internet</p>
            </div>
          </div>
          <button 
            onClick={downloadHtml}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md shadow-emerald-200"
          >
            <Download className="w-4 h-4" />
            Tải file .html
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Parameters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Thông số thí nghiệm
            </h4>
            <button 
              onClick={handleReset}
              className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Đặt lại
            </button>
          </div>

          <div className="space-y-6">
            {simulation.parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-600 font-medium">{param.label}</label>
                  <span className="text-emerald-700 font-bold">
                    {params[param.name]} {param.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={params[param.name]}
                  onChange={(e) => updateParam(param.name, parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{param.min}</span>
                  <span>{param.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Questions - AI Generated */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Câu hỏi thực hành
              <span className="ml-auto text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                {questions.length} câu
              </span>
            </h4>
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-800 font-semibold mb-3 leading-relaxed">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      const hasAnswered = selectedAnswers[qIdx] !== undefined && selectedAnswers[qIdx] !== null;
                      
                      let btnClass = "text-[11px] p-2.5 bg-white border rounded-lg transition-all text-left flex items-center gap-2";
                      if (hasAnswered) {
                        if (isCorrect) {
                          btnClass += " border-emerald-500 bg-emerald-50 text-emerald-700";
                        } else if (isSelected && !isCorrect) {
                          btnClass += " border-red-400 bg-red-50 text-red-600";
                        } else {
                          btnClass += " border-slate-200 text-slate-500 opacity-60";
                        }
                      } else {
                        btnClass += " border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 cursor-pointer";
                      }

                      return (
                        <button 
                          key={optIdx}
                          onClick={() => !hasAnswered && handleSelectAnswer(qIdx, optIdx)}
                          disabled={hasAnswered}
                          className={btnClass}
                        >
                          {hasAnswered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                          {hasAnswered && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanations[qIdx] && q.explanation && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-[10px] text-amber-800 font-medium flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{q.explanation}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Guide - AI Generated */}
        {guide && (guide.objectives?.length > 0 || guide.steps?.length > 0 || guide.tips?.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <button 
              onClick={() => setExpandGuide(!expandGuide)}
              className="w-full flex justify-between items-center mb-4"
            >
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-purple-600" />
                Hướng dẫn giảng dạy
              </h4>
              {expandGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expandGuide && (
              <div className="space-y-5">
                {/* Objectives */}
                {guide.objectives && guide.objectives.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      Mục tiêu bài học
                    </h5>
                    <ul className="space-y-1.5">
                      {guide.objectives.map((obj, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Steps */}
                {guide.steps && guide.steps.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <Play className="w-3.5 h-3.5 text-blue-600" />
                      Các bước thực hiện
                    </h5>
                    <ol className="space-y-2">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                          <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips */}
                {guide.tips && guide.tips.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <h5 className="text-[11px] font-bold text-purple-700 mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Mẹo giảng dạy
                    </h5>
                    <ul className="space-y-1.5">
                      {guide.tips.map((tip, i) => (
                        <li key={i} className="text-[10px] text-purple-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-purple-400">💡</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick help for simulations without AI content */}
        {questions.length === 0 && !guide && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Câu hỏi thực hành
              </h4>
              <p className="text-xs text-slate-500 italic text-center py-4">
                Tạo mô phỏng mới bằng AI để nhận câu hỏi thực hành tự động.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-purple-600" />
                Hướng dẫn giảng dạy
              </h4>
              <p className="text-xs text-slate-500 italic text-center py-4">
                Tạo mô phỏng mới bằng AI để nhận hướng dẫn giảng dạy tự động.
              </p>
            </div>
          </>
        )}

        {/* Quick guide */}
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
          <h4 className="font-bold text-emerald-800 mb-2 text-sm">Hướng dẫn nhanh</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Điều chỉnh các thanh trượt để thay đổi biến số. Quan sát sự thay đổi trực quan trên mô hình thí nghiệm và dữ liệu thời gian thực.
          </p>
        </div>
      </div>
    </div>
  );
};
v

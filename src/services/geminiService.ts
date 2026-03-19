import { GoogleGenAI } from "@google/genai";

// Thứ tự fallback theo AI.md §1
const FALLBACK_MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];

/**
 * Gọi Gemini AI với model cụ thể hoặc fallback tự động
 * Hỗ trợ chọn model từ Settings hoặc fallback khi lỗi
 */
export async function callGeminiAI(
  prompt: string, 
  modelIndex = 0,
  selectedModel?: string
): Promise<string | null> {
  const API_KEY = localStorage.getItem('gemini_api_key');
  if (!API_KEY) {
    throw new Error('Vui lòng nhập API Key trong phần cài đặt!');
  }

  // Nếu có model được chọn từ Settings, dùng model đó trước
  const modelsToTry = selectedModel 
    ? [selectedModel, ...FALLBACK_MODELS.filter(m => m !== selectedModel)]
    : FALLBACK_MODELS;

  const currentModel = modelsToTry[modelIndex];
  if (!currentModel) {
    throw new Error('Tất cả các model đều thất bại. Vui lòng thử lại sau.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: currentModel,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    return response.text || '';
  } catch (error: any) {
    console.warn(`Model ${currentModel} failed:`, error?.message || error);

    // Fallback to next model if available
    if (modelIndex < modelsToTry.length - 1) {
      console.warn(`Đang thử model tiếp theo: ${modelsToTry[modelIndex + 1]}...`);
      return callGeminiAI(prompt, modelIndex + 1, selectedModel);
    }

    // Tất cả model đều thất bại → throw error nguyên văn (AI.md §3)
    const errorMessage = error?.message || 'Lỗi không xác định';
    const statusCode = error?.status || error?.code || '';
    const fullError = statusCode 
      ? `${statusCode}: ${errorMessage}` 
      : errorMessage;
    
    throw new Error(`Tất cả model đều thất bại. Lỗi cuối cùng: ${fullError}`);
  }
}

export async function generateSimulation(
  topic: string, 
  subject: string, 
  grade: string,
  selectedModel?: string
): Promise<{ html: string, parameters: any[], practiceQuestions: any[], teacherGuide: any }> {
  const prompt = `
    Bạn là một chuyên gia tạo mô phỏng thí nghiệm khoa học tương tác HTML5 và nội dung giáo dục.
    Hãy tạo một mô phỏng thí nghiệm cho chủ đề: "${topic}" thuộc môn "${subject}" cho lớp "${grade}".
    
    Yêu cầu:
    1. Trả về một đối tượng JSON duy nhất chứa:
       - "html": Mã nguồn HTML5 hoàn chỉnh (bao gồm CSS và JS bên trong) để chạy mô phỏng. 
         Mô phỏng phải có:
         - Một khu vực canvas hoặc SVG để hiển thị thí nghiệm.
         - Một hàm updateSimulation(params) để cập nhật trạng thái thí nghiệm dựa trên các tham số.
         - Giao diện trực quan, khoa học, sử dụng màu sắc chuyên nghiệp.
       - "parameters": Một mảng các đối tượng tham số có thể điều chỉnh:
         { "name": "variable_name", "label": "Tên hiển thị", "min": 0, "max": 100, "step": 1, "defaultValue": 50, "unit": "đơn vị" }
       - "practiceQuestions": Mảng 3-5 câu hỏi thực hành trắc nghiệm liên quan trực tiếp đến thí nghiệm:
         { "question": "Nội dung câu hỏi", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctIndex": 0, "explanation": "Giải thích đáp án đúng" }
       - "teacherGuide": Hướng dẫn cho giáo viên sử dụng mô phỏng này trong giảng dạy:
         { "objectives": ["Mục tiêu bài học 1", "..."], "steps": ["Bước 1: ...", "Bước 2: ...", "..."], "tips": ["Mẹo giảng dạy 1", "..."] }
    
    2. Mã HTML phải tự túc (self-contained), không dùng thư viện ngoài trừ khi là CDN phổ biến (như Chart.js nếu cần).
    3. Đảm bảo tính chính xác khoa học của các công thức vật lý/hóa học.
    4. Ngôn ngữ hiển thị trong mô phỏng và tất cả nội dung là tiếng Việt.
    5. Câu hỏi thực hành phải liên quan trực tiếp đến thí nghiệm mô phỏng, yêu cầu học sinh tư duy và phân tích.
    6. Hướng dẫn giáo viên phải thực tế, có thể áp dụng trực tiếp trong lớp học.
    
    Chỉ trả về JSON, không có văn bản nào khác.
  `;

  const response = await callGeminiAI(prompt, 0, selectedModel);
  if (!response) throw new Error('Không nhận được phản hồi từ AI');

  try {
    // Extract JSON from response (sometimes AI wraps it in \`\`\`json ... \`\`\`)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    const parsed = JSON.parse(jsonStr);
    return {
      html: parsed.html || '',
      parameters: parsed.parameters || [],
      practiceQuestions: parsed.practiceQuestions || [],
      teacherGuide: parsed.teacherGuide || { objectives: [], steps: [], tips: [] },
    };
  } catch (e) {
    console.error('Lỗi parse JSON từ AI:', response);
    throw new Error('Phản hồi từ AI không đúng định dạng JSON');
  }
}

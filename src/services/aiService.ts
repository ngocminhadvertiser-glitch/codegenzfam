export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ParentCoachAnalysis {
  empathyAnalysis: string;
  suggestedMessages: string[];
  thingsToAvoid: string[];
  actionTip: string;
}

export const aiService = {
  async sendMessage(params: {
    message: string;
    role: 'student' | 'parent';
    context?: string;
    history?: AIChatMessage[];
  }): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error('Lỗi kết nối máy chủ AI');
      }
      const data = await response.json();
      return data.reply || 'Cảm ơn bạn đã chia sẻ. Mình luôn đồng hành cùng bạn.';
    } catch (error) {
      console.warn('AI fallback triggered:', error);
      if (params.role === 'student') {
        return 'Mình hiểu bạn đang trải qua những cảm xúc này. Để bắt đầu nói chuyện với bố mẹ, bạn hãy chọn một thời điểm cả nhà thảnh thơi và mở đầu bằng: "Bố mẹ ơi, con muốn tâm sự một chút về chuyện trường lớp..." nhé!';
      } else {
        return 'Cha mẹ hãy kiên nhẫn lắng nghe con bằng 100% sự chú ý, ghi nhận cảm xúc của con trước khi đưa ra giải pháp nhé!';
      }
    }
  },

  async getParentCoaching(params: {
    emotion: string;
    intensity: number;
    reason: string;
    wishToUnderstand: string;
    studentName?: string;
  }): Promise<ParentCoachAnalysis> {
    try {
      const response = await fetch('/api/ai/parent-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error('Lỗi phân tích AI cha mẹ');
      }
      return await response.json();
    } catch (error) {
      console.warn('AI parent coach fallback:', error);
      return {
        empathyAnalysis: `Con đang cảm thấy ${params.emotion} (mức độ ${params.intensity}/10). Điều con khao khát nhất là được cha mẹ thấu hiểu và tin tưởng mà không vội vàng phán xét.`,
        suggestedMessages: [
          `"Mẹ đã đọc nhật ký của con rồi. Cảm ơn con gái đã tin tưởng mở lòng với mẹ. Mẹ luôn ở đây đồng hành cùng con."`,
          `"Bố hiểu con đang rất nỗ lực. Kết quả thế nào bố mẹ cũng luôn yêu thương con."`,
          `"Hôm nay con đã vất vả nhiều rồi, con nghỉ ngơi một chút nhé!"`,
        ],
        thingsToAvoid: [
          'Tránh nói: "Có thế mà cũng stress", "Ngày xưa bố mẹ khổ hơn nhiều".',
          'Tránh so sánh con với anh chị em hoặc bạn cùng lớp.',
          'Tránh chất vấn điểm số ngay khi con vừa chia sẻ áp lực.',
        ],
        actionTip: 'Hãy dành cho con một cái ôm ấm áp hoặc chuẩn bị một món ăn nhẹ con thích.',
      };
    }
  },

  async getIcebreakers(topic: string, difficulty: string = 'vừa phải'): Promise<string[]> {
    try {
      const response = await fetch('/api/ai/icebreakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
      });
      if (!response.ok) {
        throw new Error('Lỗi tạo câu mở đầu');
      }
      const data = await response.json();
      return data.icebreakers || [];
    } catch (error) {
      return [
        `"Bố mẹ ơi, tối nay bố mẹ có rảnh khoảng 10 phút không ạ? Con có chuyện này muốn xin lời khuyên nhẹ nhàng từ bố mẹ..."`,
        `"Con biết bố mẹ luôn kỳ vọng và thương con. Nhưng dạo này con đang gặp chút áp lực về ${topic}, con muốn tâm sự để bố mẹ hiểu con hơn ạ."`,
        `"Hôm nay trên trường có chuyện này làm con suy nghĩ mãi, con kể bố mẹ nghe thử nhé?"`,
      ];
    }
  },
};

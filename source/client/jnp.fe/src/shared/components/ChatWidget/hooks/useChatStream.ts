import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingContent?: string;
  type?: 'text' | 'status' | 'auth_required';
  metadataInfo?: {
    auth_required: boolean;
    login_url: string;
    register_url: string;
  };
  createdAt?: string | number; // Bổ sung thời gian tạo
}

export const useChatStream = (baseUrl: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, guestId: string, widgetKey: string, token?: string) => {
    if (!content.trim()) return;

    // Tin nhắn của User
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { 
        id: userMsgId, 
        role: 'user', 
        content,
        createdAt: new Date().toISOString() // Gán thời gian hiện tại
    }]);
    
    setIsStreaming(true);
    
    try {
      const streamUrl = `${baseUrl}/api/v1/chat/widget/stream`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Guest-ID': guestId
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: content,
          conversationId: conversationId,
          widgetKey: widgetKey
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsgId = '';
      let currentContent = '';
      let currentThinkingContent = '';
      let buffer = '';
      let eventDataLines: string[] = []; // Ghép nhiều dòng data: trong cùng 1 SSE event

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            // Flush bytes còn lại trong TextDecoder (ký tự multi-byte bị cắt cuối stream)
            const remaining = decoder.decode();
            if (remaining) buffer += remaining;

            // Xử lý nốt dữ liệu còn trong buffer
            if (buffer.trim()) {
              processRawLine(buffer);
            }
            // Flush event cuối cùng nếu có
            flushEvent();
            break;
          }

          // stream: true → giữ lại bytes chưa đủ ký tự multi-byte (UTF-8 tiếng Việt)
          buffer += decoder.decode(value, { stream: true });

          // Chuẩn hóa line endings: \r\n → \n, \r → \n (đảm bảo tương thích mọi OS)
          buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

          // Split thành các dòng, giữ lại phần dở dang ở cuối
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            processRawLine(line);
          }
        }
      }

      /**
       * Xử lý từng dòng raw SSE theo spec W3C:
       * - Dòng bắt đầu bằng "data:" → tích lũy vào eventDataLines
       * - Dòng trống → kết thúc 1 SSE event → flush và parse JSON
       * - Các dòng khác (event:, id:, retry:, comment) → bỏ qua
       */
      function processRawLine(line: string) {
        if (line.startsWith('data:')) {
          // SSE spec: nếu sau "data:" có space thì bỏ space đầu tiên
          const value = line.charAt(5) === ' ' ? line.substring(6) : line.substring(5);
          eventDataLines.push(value);
        } else if (line.trim() === '') {
          // Dòng trống = kết thúc SSE event → flush
          flushEvent();
        }
        // Bỏ qua các dòng khác: event:, id:, retry:, comment (:...)
      }

      /** Ghép các data lines và parse JSON thành chunk */
      function flushEvent() {
        if (eventDataLines.length === 0) return;

        // SSE spec: ghép nhiều data: lines bằng \n
        const eventData = eventDataLines.join('\n').trim();
        eventDataLines = [];

        if (!eventData || eventData === '[DONE]') return;

        try {
          const data = JSON.parse(eventData);

          if (data.type === 'finish') return;

          if (!assistantMsgId) {
            assistantMsgId = data.messageId || 'assistant-' + Date.now();
            setConversationId(data.conversationId);
            setMessages(prev => [...prev, {
              id: assistantMsgId,
              role: 'assistant',
              content: '',
              thinkingContent: '',
              type: data.type,
              createdAt: new Date().toISOString()
            }]);
          }

          if (data.type === 'text') {
            currentContent += data.content;
            setMessages(prev => prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: currentContent } : m
            ));
          } else if (data.type === 'status') {
            currentThinkingContent = data.content;
            setMessages(prev => prev.map(m =>
              m.id === assistantMsgId ? { ...m, thinkingContent: currentThinkingContent } : m
            ));
          } else if (data.type === 'auth_required') {
            currentContent += data.content;
            setMessages(prev => prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: currentContent, type: 'auth_required', metadataInfo: data.metadataInfo } : m
            ));
          }
        } catch {
          // Bỏ qua event không parse được JSON
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: 'error-' + Date.now(), 
        role: 'assistant', 
        content: 'Xin lỗi, có lỗi kết nối xảy ra. Vui lòng thử lại.',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsStreaming(false);
    }
  }, [baseUrl, conversationId]);

  return { messages, sendMessage, isStreaming, setMessages, conversationId, setConversationId };
};

import { CloseOutlined, CompressOutlined, DislikeOutlined, ExpandAltOutlined, LikeOutlined, LockOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useChatStream } from '../hooks/useChatStream';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  widgetKey: string;
}

interface WidgetConfig {
  botName: string;
  welcomeMessage: string;
}

// --- STYLED COMPONENTS ---

const WindowContainer = styled.div<{ $isOpen: boolean; $isExpanded: boolean }>`
  position: ${props => props.$isExpanded ? 'fixed' : 'absolute'};
  bottom: ${props => props.$isExpanded ? '5vh' : '80px'};
  right: ${props => props.$isExpanded ? '5vw' : '0'};
  width: ${props => props.$isExpanded ? 'min(90vw, 800px)' : '420px'};
  height: ${props => props.$isExpanded ? 'min(90vh, 700px)' : '600px'};
  background: white;
  border-radius: ${props => props.$isExpanded ? '16px' : '20px'};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: bottom right;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(40px)'};
  pointer-events: ${props => props.$isOpen ? 'all' : 'none'};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  z-index: ${props => props.$isExpanded ? '2147483647' : 'auto'};
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
`;

const BotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BotAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b1d2c;
  font-size: 20px;
  border: 1px solid #eee;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #bfbfbf;
  font-size: 16px;
  flex-shrink: 0;
`;

const GuestBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #8b1d2c;
  color: #8b1d2c;
  border-radius: 50px;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  line-height: 1;
  background: transparent;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #fadb14;
    border-radius: 50%;
  }
`;

const ControlBtn = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  transition: all 0.2s;
  &:hover {
    background: #f0f0f0;
    color: #595959;
  }
`;

const MessageList = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
`;

const LoadingMore = styled.div`
  text-align: center;
  font-size: 11px;
  color: #bfbfbf;
  padding: 10px 0;
`;

const DateDivider = styled.div`
  text-align: center;
  font-size: 11px;
  color: #bfbfbf;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 10px 0;
`;

const MsgBubble = styled.div<{ $isUser?: boolean }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: ${props => props.$isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px'};
  background: ${props => props.$isUser ? '#8b1d2c' : '#f8f9fa'};
  color: ${props => props.$isUser ? '#fff' : '#262626'};
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  font-size: 14px;
  line-height: 1.5;
  white-space: ${props => props.$isUser ? 'pre-wrap' : 'normal'};
  word-break: break-word;
  border: ${props => props.$isUser ? 'none' : '1px solid #f0f0f0'};
  box-shadow: ${props => props.$isUser ? '0 4px 10px rgba(139, 29, 44, 0.2)' : 'none'};
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const MsgFooter = styled.div<{ $isUser?: boolean }>`
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 4px;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  display: flex;
  gap: 8px;
`;

const FooterArea = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
`;

const InputContainer = styled.div`
  background: #f5f5f5;
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  min-height: 100px;
`;

const StyledTextArea = styled.textarea`
  background: transparent;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  flex: 1;
  padding: 8px 0;
  color: #262626;
  &::placeholder { color: #bfbfbf; }
`;

const Disclaimer = styled.div`
  text-align: center;
  margin-top: 10px;
  font-size: 10px;
  color: #8c8c8c;
  line-height: 1.4;
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const AnimatedRobotIcon = styled(RobotOutlined)`
  animation: ${pulse} 1.5s infinite;
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
`;

const LoadingBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b1d2c;
  font-weight: 500;
  font-size: 13px;
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid #8b1d2c20;
  border-top: 2px solid #8b1d2c;
  border-radius: 50%;
  animation: ${rotate} 0.8s linear infinite;
  display: inline-block;
`;

const ThinkingContainer = styled.div`
  background: #fdfdfd;
  border-left: 3px solid #8b1d2c;
  padding: 8px 12px;
  border-radius: 4px 8px 8px 4px;
  margin-top: 6px;
  font-size: 12px;
  color: #595959;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
`;

const BouncingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 4px;
  
  span {
    width: 4px;
    height: 4px;
    background-color: #8b1d2c;
    border-radius: 50%;
    display: inline-block;
    animation: ${bounce} 1.4s infinite ease-in-out both;
  }
  
  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }
`;

const AuthCard = styled.div`
  border: 1px solid #ffcccb;
  border-radius: 16px;
  padding: 18px;
  background: #fffdfd;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: stretch;
  box-shadow: 0 4px 12px rgba(139, 29, 44, 0.04);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
`;

const AuthHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8b1d2c;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
`;

const AuthTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const AuthTag = styled.span`
  background: #ffebee;
  color: #8b1d2c;
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 50px;
  font-weight: 500;
  line-height: 1.2;
`;

const AuthButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

const AuthBtnSolid = styled.a`
  background: #8b1d2c;
  color: #fff !important;
  font-size: 13px;
  font-weight: bold;
  padding: 8px 18px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #8b1d2c;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #a82436;
    border-color: #a82436;
    color: #fff !important;
  }
`;

const AuthBtnOutlined = styled.a`
  background: #fff;
  color: #8b1d2c !important;
  border: 1px solid #8b1d2c;
  font-size: 13px;
  font-weight: bold;
  padding: 8px 18px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #ffebee;
    border-color: #8b1d2c;
    color: #8b1d2c !important;
  }
`;

const AuthBtnSecondary = styled.button`
  background: #fff;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
    color: #595959;
    border-color: #bfbfbf;
  }
`;

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, widgetKey }) => {
  const [inputValue, setInputValue] = useState('');
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State cho Lazy Loading
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const widgetConfig = (window as any).AI_WIDGET_CONFIG || {};
  const apiUrl = widgetConfig.apiUrl || (import.meta.env?.VITE_API_AI_URL || 'http://localhost:8085/api').replace('/api', '');
  const [token, setToken] = useState(() => widgetConfig.token || '');
  
  const { messages, sendMessage, isStreaming, conversationId, setMessages, setConversationId } = useChatStream(apiUrl);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lắng nghe sự kiện tương tác để cập nhật token
  useEffect(() => {
    const checkToken = () => {
      const currentToken = (window as any).AI_WIDGET_CONFIG?.token || '';
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };

    // 1. Check khi trình duyệt được focus lại
    window.addEventListener('focus', checkToken);
    
    // 2. Check khi người dùng click trên trang (ví dụ click nút đăng nhập, click ô chat...)
    window.addEventListener('click', checkToken);
    
    // 3. Quét định kỳ 500ms để bắt các thay đổi ngầm/bất đồng bộ từ ứng dụng chính
    const intervalId = setInterval(checkToken, 500);
    
    // 4. Check khi trạng thái mở/đóng thay đổi
    if (isOpen) {
      checkToken();
    }

    return () => {
      window.removeEventListener('focus', checkToken);
      window.removeEventListener('click', checkToken);
      clearInterval(intervalId);
    };
  }, [isOpen, token]);

  // Load cấu hình Widget
  useEffect(() => {
    if (widgetKey) {
      fetch(`${apiUrl}/api/v1/chat/widget/config/${widgetKey}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) setConfig(res.data);
        })
        .catch(() => {});
    }
  }, [widgetKey, apiUrl]);

  // Hàm load tin nhắn theo trang
  const fetchMessages = useCallback((pageNum: number) => {
    const guestId = localStorage.getItem('ai_widget_guest_id');
    if (!apiUrl) return;

    setIsLoadingMore(true);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Guest-ID': guestId || ''
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Load với sort DESC để lấy tin mới nhất trước, nhưng hiển thị ASC
    fetch(`${apiUrl}/api/v1/chat/widget/messages?size=20&page=${pageNum}&sort=createdAt,desc`, {
      headers: headers
    })
    .then(res => res.json())
    .then(res => {
      if (res.success && res.data) {
        const initialRatings: Record<string, number> = {};
        const newMessages = res.data.map((m: any) => {
          if (m.sender === 'assistant' && m.rating !== null && m.rating !== undefined) {
            initialRatings[m.messageId] = m.rating;
          }
          const isAuthRequired = m.sender === 'assistant' && m.content && m.content.includes('dang-nhap') && m.content.includes('dang-ky');
          return {
            id: m.messageId,
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
            type: isAuthRequired ? 'auth_required' : undefined,
            metadataInfo: isAuthRequired ? {
              auth_required: true,
              login_url: 'https://cmcdtqg.dieuhanhso.vn/dang-nhap',
              register_url: 'https://cmcdtqg.dieuhanhso.vn/nha-dau-tu/dang-ky-tai-khoan'
            } : undefined,
            createdAt: m.createdAt
          };
        }).reverse();

        if (Object.keys(initialRatings).length > 0) {
          setRatings(prev => ({ ...prev, ...initialRatings }));
        }

        if (pageNum === 0) {
          setMessages(newMessages);
          // Scroll xuống cuối cùng ở lần load đầu
          setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }, 100);
          
          // Cập nhật conversationId từ tin nhắn mới nhất
          const lastMsg = res.data[0]; // Vì đang desc nên [0] là mới nhất
          if (lastMsg?.conversationId) setConversationId(lastMsg.conversationId);
        } else {
          // Lưu lại scrollHeight trước khi thêm tin nhắn cũ
          const oldScrollHeight = scrollRef.current?.scrollHeight || 0;
          
          setMessages(prev => [...newMessages, ...prev]);
          
          // Sau khi React render xong tin nhắn mới, điều chỉnh lại scroll để không bị nhảy
          setTimeout(() => {
            if (scrollRef.current) {
              const newScrollHeight = scrollRef.current.scrollHeight;
              scrollRef.current.scrollTop = newScrollHeight - oldScrollHeight;
            }
          }, 0);
        }

        setHasMore(res.data.length === 20);
      }
    })
    .catch(() => {})
    .finally(() => setIsLoadingMore(false));
  }, [apiUrl, token, setMessages, setConversationId]);

  // Khởi tạo/tải lại tin nhắn trang 0 khi apiUrl hoặc token thay đổi
  useEffect(() => {
    if (apiUrl) {
      setPage(0);
      setHasMore(true);
      fetchMessages(0);
    }
  }, [apiUrl, token]);

  // Xử lý sự kiện scroll để lazy load
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  // Tự động scroll xuống khi có tin nhắn mới hoặc đang streaming
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      // Luôn scroll xuống khi: đang streaming, vừa gửi tin nhắn, hoặc đang ở gần cuối
      if (isStreaming || isAtBottom || messages[messages.length - 1]?.role === 'user') {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [messages, isStreaming]);

  // Tự động scroll xuống cuối khi cửa sổ chat được mở (isOpen thay đổi từ false -> true)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 150);
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isStreaming) return;
    const guestId = localStorage.getItem('ai_widget_guest_id') || 'guest-' + Math.random().toString(36).substring(7);
    localStorage.setItem('ai_widget_guest_id', guestId);
    
    sendMessage(trimmedValue, guestId, widgetKey, token);
    setInputValue('');
  };

  const handleRate = (messageId: string, rating: number) => {
    if (!conversationId || !messageId) return;
    
    const guestId = localStorage.getItem('ai_widget_guest_id');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Guest-ID': guestId || ''
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${apiUrl}/api/v1/chat/widget/messages/rating`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        conversationId,
        messageId,
        rating
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        setRatings(prev => ({ ...prev, [messageId]: rating }));
      }
    })
    .catch(() => {});
  };

  const handleDismissAuth = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const formatTime = (date?: string | number) => {
    if (!date) return 'Vừa xong';
    const now = dayjs();
    const d = dayjs(date);
    const diffInMinutes = now.diff(d, 'minute');
    if (diffInMinutes < 1) return 'Vừa xong';
    if (d.isSame(now, 'day')) return d.format('HH:mm');
    if (d.isSame(now, 'year')) return d.format('DD/MM HH:mm');
    return d.format('DD/MM/YYYY HH:mm');
  };

  if (!isOpen && !config) return null;

  return (
    <WindowContainer $isOpen={isOpen} $isExpanded={isExpanded}>
      <Header>
        <BotInfo>
          <BotAvatar><RobotOutlined /></BotAvatar>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 15, color: '#262626' }}>{config?.botName || 'Trợ lý AI'}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>Đội ngũ sẵn sàng hỗ trợ bạn</div>
          </div>
        </BotInfo>
        <Controls>
          {!token && <GuestBadge>Chế độ khách</GuestBadge>}
          <ControlBtn onClick={() => setIsExpanded(prev => !prev)} title={isExpanded ? 'Thu gọn' : 'Mở rộng'}>
            {isExpanded ? <CompressOutlined /> : <ExpandAltOutlined />}
          </ControlBtn>
          <ControlBtn onClick={onClose} title="Đóng">
            <CloseOutlined />
          </ControlBtn>
        </Controls>
      </Header>
      
      <MessageList ref={scrollRef} onScroll={handleScroll}>
        {isLoadingMore && <LoadingMore>Đang tải tin nhắn cũ...</LoadingMore>}
        
        <DateDivider>Hôm nay</DateDivider>
        
        <MsgBubble>
          <MarkdownRenderer content={config?.welcomeMessage || 'Chào bạn, tôi có thể giúp gì cho bạn?'} />
        </MsgBubble>
        <MsgFooter>
          <span style={{ fontSize: 11 }}>Trợ lý AI • {formatTime(undefined)}</span>
        </MsgFooter>

        {messages.map((msg, idx) => (
          <React.Fragment key={msg.id || idx}>
            {msg.type === 'auth_required' ? (
              <AuthCard>
                <AuthHeader>
                  <LockOutlined style={{ fontSize: '16px', color: '#8b1d2c' }} />
                  <span>Đăng nhập để Trợ lý AI đồng hành sâu hơn với dự án của Anh/Chị</span>
                </AuthHeader>
                <AuthTagsRow>
                  <AuthTag>Lưu lịch sử</AuthTag>
                  <AuthTag>Tạo hồ sơ dự án</AuthTag>
                  <AuthTag>Gợi ý điều kiện, hồ sơ, lộ trình</AuthTag>
                </AuthTagsRow>
                <AuthButtonsRow>
                  <AuthBtnSolid 
                    href={msg.metadataInfo?.login_url || 'https://cmcdtqg.dieuhanhso.vn/dang-nhap'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Đăng nhập ngay
                  </AuthBtnSolid>
                  <AuthBtnOutlined 
                    href={msg.metadataInfo?.register_url || 'https://cmcdtqg.dieuhanhso.vn/nha-dau-tu/dang-ky-tai-khoan'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Đăng ký
                  </AuthBtnOutlined>
                  <AuthBtnSecondary onClick={() => handleDismissAuth(msg.id)}>
                    Để sau
                  </AuthBtnSecondary>
                </AuthButtonsRow>
              </AuthCard>
            ) : (
              <>
                <MsgBubble $isUser={msg.role === 'user'}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    msg.content ? (
                      <>
                        <MarkdownRenderer content={msg.content} />
                        {isStreaming && idx === messages.length - 1 && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            color: '#8c8c8c', 
                            fontSize: '11px', 
                            marginTop: '8px', 
                            fontStyle: 'italic',
                            borderTop: '1px solid #f5f5f5',
                            paddingTop: '6px'
                          }}>
                            <Spinner style={{ width: '10px', height: '10px', borderWidth: '1.5px', borderColor: '#8c8c8c20', borderTopColor: '#8c8c8c' }} />
                            <span>Trợ lý AI đang phản hồi</span>
                            <BouncingDots style={{ gap: '2px' }}>
                              <span style={{ backgroundColor: '#8c8c8c', width: '3px', height: '3px' }}></span>
                              <span style={{ backgroundColor: '#8c8c8c', width: '3px', height: '3px' }}></span>
                              <span style={{ backgroundColor: '#8c8c8c', width: '3px', height: '3px' }}></span>
                            </BouncingDots>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <LoadingBubble>
                          <Spinner />
                          <span style={{ color: '#262626' }}>Trợ lý AI đang phản hồi</span>
                          <BouncingDots>
                            <span></span>
                            <span></span>
                            <span></span>
                          </BouncingDots>
                        </LoadingBubble>
                        {msg.thinkingContent && (
                          <ThinkingContainer>
                            <div style={{ fontStyle: 'italic', color: '#8c8c8c', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AnimatedRobotIcon style={{ fontSize: '12px', flexShrink: 0 }} />
                              <span>{msg.thinkingContent}</span>
                            </div>
                          </ThinkingContainer>
                        )}
                      </div>
                    )
                  )}
                </MsgBubble>
                <MsgFooter $isUser={msg.role === 'user'}>
                  {msg.role === 'user' ? 'Bạn' : 'Trợ lý AI'} • {formatTime(msg.createdAt)}
                  {msg.role === 'assistant' && msg.id && !msg.id.startsWith('error-') && (
                    <Space size={12} style={{ marginLeft: 8, display: 'inline-flex', gap: 12 }}>
                      <LikeOutlined 
                        style={{ 
                            cursor: 'pointer', 
                            color: ratings[msg.id] === 1 ? '#8b1d2c' : 'inherit' 
                        }} 
                        onClick={() => handleRate(msg.id, 1)}
                      />
                      <DislikeOutlined 
                        style={{ 
                            cursor: 'pointer', 
                            color: ratings[msg.id] === -1 ? '#8b1d2c' : 'inherit' 
                        }} 
                        onClick={() => handleRate(msg.id, -1)}
                      />
                    </Space>
                  )}
                </MsgFooter>
              </>
            )}
          </React.Fragment>
        ))}
        
        {isStreaming && messages[messages.length-1]?.role === 'user' && (
          <MsgBubble>
            <LoadingBubble>
              <Spinner />
              <span>Trợ lý AI đã ghi nhận yêu cầu của anh/chị</span>
            </LoadingBubble>
          </MsgBubble>
        )}
      </MessageList>

      <FooterArea>
        <InputContainer>
          <StyledTextArea 
            placeholder="Nhập câu hỏi về thủ tục, hồ sơ, điều kiện hoặc ưu đãi đầu tư..."
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 2000) {
                setInputValue(value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
            disabled={isStreaming}
            maxLength={2000}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <SendOutlined 
                style={{ 
                  color: (inputValue.trim() && !isStreaming) ? '#8b1d2c' : '#bfbfbf', 
                  fontSize: 20, 
                  cursor: 'pointer' 
                }} 
                onClick={handleSend}
             />
          </div>
        </InputContainer>
        <Disclaimer>
          Thông tin Trợ lý AI cung cấp chỉ mang tính hỗ trợ. <br/> Vui lòng kiểm tra nội dung quan trọng <span style={{ opacity: 0.6, fontSize: '9px', fontStyle: 'italic', marginLeft: '2px' }}>(v1.0.9)</span>.
        </Disclaimer>
      </FooterArea>
    </WindowContainer>
  );
};

const Space: React.FC<{ size: number, children: React.ReactNode, style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ display: 'flex', gap: 12, ...style }}>{children}</div>
);

export default ChatWindow;

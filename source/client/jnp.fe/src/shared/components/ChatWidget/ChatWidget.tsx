import React, { useState } from 'react';
import styled from 'styled-components';
import ChatBubble from './components/ChatBubble';
import ChatWindow from './components/ChatWindow';

interface ChatWidgetProps {
  widgetKey: string;
}

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const ChatWidget: React.FC<ChatWidgetProps> = ({ widgetKey }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <WidgetContainer>
      {/* Cửa sổ Chat */}
      <ChatWindow 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        widgetKey={widgetKey} 
      />
      
      {/* Nút bấm mở Chat */}
      <ChatBubble 
        isOpen={isOpen} 
        onClick={toggleChat} 
      />
    </WidgetContainer>
  );
};

export default ChatWidget;

import React from 'react';
import styled from 'styled-components';

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
}

const BubbleButton = styled.button<{ $isOpen: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #8b1d2c;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 30px;
    height: 30px;
    fill: white;
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(90deg)' : 'rotate(0)'};
  }
`;

const ChatBubble: React.FC<ChatBubbleProps> = ({ isOpen, onClick }) => {
  return (
    <BubbleButton $isOpen={isOpen} onClick={onClick} aria-label="Mở cửa sổ chat">
      {isOpen ? (
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      )}
    </BubbleButton>
  );
};

export default ChatBubble;

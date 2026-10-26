import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';
import {
  BulbOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  CopyOutlined,
  CheckOutlined,
} from '@ant-design/icons';

interface MarkdownRendererProps {
  content: string;
}

// Helper function to extract plain text from React node children
const getTextFromReactNode = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextFromReactNode).join('');
  if (node.props && node.props.children) return getTextFromReactNode(node.props.children);
  return '';
};

// Helper function to strip raw alert emojis (💡, 📌) from the beginning of nodes
const stripLeadingAlertEmoji = (node: React.ReactNode): React.ReactNode => {
  if (typeof node === 'string') {
    return node.replace(/^[💡📌]\s*/, '');
  }
  if (Array.isArray(node)) {
    return React.Children.map(node, (child, idx) =>
      idx === 0 ? stripLeadingAlertEmoji(child) : child
    );
  }
  if (React.isValidElement(node) && (node.props as any)?.children) {
    return React.cloneElement(node as React.ReactElement<any>, {
      children: stripLeadingAlertEmoji((node.props as any).children),
    });
  }
  return node;
};

// Copy Button Component for Code Blocks
const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <StyledCopyBtn onClick={handleCopy} type="button">
      {copied ? (
        <>
          <CheckOutlined style={{ marginRight: 4, color: '#52c41a' }} />
          Copied!
        </>
      ) : (
        <>
          <CopyOutlined style={{ marginRight: 4 }} />
          Copy
        </>
      )}
    </StyledCopyBtn>
  );
};

// --- STYLED COMPONENTS ---

const MarkdownWrapper = styled.div`
  line-height: 1.6;
  font-size: 14px;
  color: #262626;
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  white-space: normal;

  /* Line breaks & Paragraphs */
  p {
    margin: 0 0 6px 0;
    white-space: pre-line;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    color: #262626;
    font-weight: 700;
    margin: 12px 0 6px 0;
    line-height: 1.4;
    font-family: inherit;
  }
  
  h2 {
    font-size: 16px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 6px;
    color: #8b1d2c;
  }
  
  h3 {
    font-size: 15px;
  }

  /* Bold & Italic */
  strong {
    font-weight: 700;
    color: #1f1f1f;
  }

  em {
    font-style: italic;
    color: #595959;
  }

  /* Horizontal Rule */
  hr {
    border: none;
    border-top: 1px solid #f0f0f0;
    margin: 16px 0;
  }

  /* Lists */
  ul, ol {
    margin: 0 0 6px 20px;
    padding: 0;
    
    li {
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  /* Inline Code */
  code.inline-code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    background: #f5f5f5;
    color: #8b1d2c;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
  }

  /* Links with external icon */
  a.markdown-link {
    color: #8b1d2c;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px dashed rgba(139, 29, 44, 0.4);
    transition: all 0.2s;
    display: inline;
    word-break: break-all;
    overflow-wrap: break-word;

    &:hover {
      color: #b12b3c;
      border-bottom-style: solid;
    }
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 14px 0;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  max-width: 100%;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    text-align: left;

    th {
      background: #fafafa;
      font-weight: 600;
      color: #262626;
      padding: 10px 12px;
      border-bottom: 1px solid #e8e8e8;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f0f0f0;
      color: #595959;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }
`;

const AlertBlock = styled.blockquote<{ $type: 'warning' | 'info' | 'default' }>`
  margin: 14px 0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  line-height: 1.5;
  color: #262626;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  background: ${props => {
    if (props.$type === 'warning') return '#fffbe6';
    if (props.$type === 'info') return '#f0f5ff';
    return '#f5f5f5';
  }};

  border-left: 4px solid ${props => {
    if (props.$type === 'warning') return '#faad14';
    if (props.$type === 'info') return '#1677ff';
    return '#d9d9d9';
  }};

  .alert-icon {
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    color: ${props => {
      if (props.$type === 'warning') return '#faad14';
      if (props.$type === 'info') return '#1677ff';
      return '#8c8c8c';
    }};
  }

  .alert-content {
    flex: 1;
    min-width: 0;

    p {
      margin: 0 !important;
    }
  }
`;

const CodeBlockContainer = styled.div`
  margin: 14px 0;
  border-radius: 8px;
  background: #1e1e1e;
  overflow: hidden;
  border: 1px solid #2d2d2d;
`;

const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: #252526;
  border-bottom: 1px solid #2d2d2d;
  user-select: none;
`;

const LanguageLabel = styled.span`
  font-size: 11px;
  color: #858585;
  font-weight: 600;
  font-family: inherit;
`;

const StyledCopyBtn = styled.button`
  background: transparent;
  border: none;
  color: #858585;
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: #333333;
  }
`;

const PreWrapper = styled.pre`
  margin: 0;
  padding: 12px;
  overflow-x: auto;

  code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 12.5px;
    color: #d4d4d4;
    line-height: 1.5;
    background: transparent;
    padding: 0;
    border-radius: 0;
  }
`;

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const normalizedContent = (content || '')
    .trim()
    .replace(/\n{3,}/g, '\n\n');

  return (
    <MarkdownWrapper>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom render paragraph to filter out empty/whitespace-only paragraphs
          p: ({ children }) => {
            if (!children) return null;
            const textContent = getTextFromReactNode(children);
            const hasActualContent = textContent.replace(/\s+/g, '') !== '';
            if (!hasActualContent) {
              const hasElements = React.Children.toArray(children).some(
                child => typeof child === 'object' && child !== null
              );
              if (!hasElements) return null;
            }
            return <p>{children}</p>;
          },
          // Render links with target="_blank" and an Ant Design external link icon
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
              {children}
              <ExportOutlined style={{ marginLeft: 4, fontSize: 11, verticalAlign: 'middle' }} />
            </a>
          ),
          // Custom render blockquote to handle alerts with Ant Design icons
          blockquote: ({ children }) => {
            const textContent = getTextFromReactNode(children);
            const isWarning = /💡|\[!warning\]|\[!caution\]|cảnh báo|lưu ý|chú ý/i.test(textContent);
            const isInfo = /📌|\[!info\]|\[!note\]|\[!tip\]|thông tin|ghi chú/i.test(textContent);
            const alertType: 'warning' | 'info' | 'default' = isWarning ? 'warning' : isInfo ? 'info' : 'default';
            const cleanChildren = stripLeadingAlertEmoji(children);

            return (
              <AlertBlock $type={alertType}>
                <span className="alert-icon">
                  {alertType === 'warning' && <BulbOutlined />}
                  {alertType === 'info' && <InfoCircleOutlined />}
                  {alertType === 'default' && <InfoCircleOutlined />}
                </span>
                <div className="alert-content">{cleanChildren}</div>
              </AlertBlock>
            );
          },
          // Custom render table with wrapper for horizontal scrolling
          table: ({ children }) => (
            <TableContainer>
              <table>{children}</table>
            </TableContainer>
          ),
          // Custom render code to handle block and inline code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            const codeContent = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlockContainer>
                <CodeHeader>
                  <LanguageLabel>{match ? match[1].toUpperCase() : 'CODE'}</LanguageLabel>
                  <CopyButton code={codeContent} />
                </CodeHeader>
                <PreWrapper>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </PreWrapper>
              </CodeBlockContainer>
            );
          }
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </MarkdownWrapper>
  );
};

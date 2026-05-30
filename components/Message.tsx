import React, { useCallback, useState } from 'react';
import { MessageSender, GlossaryTerm } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { speakText, stopSpeaking, detectLanguage } from '../services/ttsService';
import { Language } from '../types';
import DiksyonèPopòv from './DiksyonèPopòv';

interface MessageProps {
  message: {
    id: string;
    sender: MessageSender;
    text: string;
    isStreaming?: boolean;
  };
  onLookupWord?: (word: string) => Promise<GlossaryTerm | null>;
}

const Message: React.FC<MessageProps> = ({ message, onLookupWord }) => {
  const isUser = message.sender === MessageSender.USER;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = useCallback(async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const lang = detectLanguage(message.text);
      await speakText(message.text, {
        lang,
        rate: 0.9,
      });
    } catch {
      // TTS Error handled silently
    } finally {
      setIsSpeaking(false);
    }
  }, [message.text, isSpeaking]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mdComponents: any = {
    h1: ({ ...props }) => <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }} {...props} />,
    h2: ({ ...props }) => <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }} {...props} />,
    h3: ({ ...props }) => <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }} {...props} />,
    p: ({ ...props }) => <p style={{ marginBottom: '10px', lineHeight: 1.7, fontSize: '14px' }} {...props} />,
    ul: ({ ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }} {...props} />,
    ol: ({ ...props }) => <ol style={{ listStyleType: 'decimal', paddingLeft: '20px', marginBottom: '10px' }} {...props} />,
    li: ({ ...props }) => <li style={{ marginBottom: '4px', fontSize: '14px' }} {...props} />,
    strong: ({ ...props }) => <strong style={{ fontWeight: 700, color: isUser ? '#fff' : 'var(--primary)' }} {...props} />,
    code: ({ inline, ...props }: any) => inline
      ? <code style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.1)' }} {...props} />
      : (
        <pre style={{ padding: '14px', borderRadius: '12px', overflowX: 'auto', marginBottom: '10px', fontSize: '12px', fontFamily: 'monospace', background: '#0f172a', color: '#e2e8f0' }}>
          <code {...props} />
        </pre>
      ),
    a: ({ ...props }) => <a style={{ color: isUser ? 'rgba(255,255,255,0.9)' : 'var(--primary)', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" {...props} />,
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      width: '100%',
    }}>
      <div style={{
        position: 'relative',
        maxWidth: '82%',
        padding: '12px 16px',
        borderRadius: isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
        background: isUser ? 'linear-gradient(135deg, #4f46e5 0%, #ffb1c7 100%)' : 'rgba(22, 29, 51, 0.85)',
        color: isUser ? '#fff' : 'var(--on-surface)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
        backdropFilter: isUser ? 'none' : 'blur(12px)',
        boxShadow: isUser
          ? '0 8px 20px rgba(79,70,229,0.3)'
          : '0 4px 24px rgba(0,0,0,0.1)',
      }}>
        {message.isStreaming && message.text === '' ? (
          <LoadingSpinner message="Pwof Ou ap reflechi..." />
        ) : isUser ? (
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
            {message.text}
          </p>
        ) : (
          <DiksyonèPopòv onLookupWord={onLookupWord || (() => Promise.resolve(null))}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {message.text}
            </ReactMarkdown>
            {message.isStreaming && (
              <span style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--primary)', borderRadius: '2px', animation: 'pulse 1s infinite', marginLeft: '4px' }} />
            )}
            {message.text && !message.isStreaming && (
              <button
                onClick={handleSpeak}
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: isSpeaking ? '5px 12px' : '5px 10px',
                  borderRadius: '10px',
                  border: isSpeaking ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                  background: isSpeaking ? 'rgba(79,70,229,0.15)' : 'var(--surface-container-lowest)',
                  color: isSpeaking ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s',
                }}
                title={isSpeaking ? 'Kanpe lektè a' : 'Koute mesaj sa a'}
              >
                {isSpeaking ? (
                  <>
                    <span className="tts-wave">
                      <span></span><span></span><span></span><span></span>
                    </span>
                    Kanpe
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    Koute
                  </>
                )}
              </button>
            )}
          </DiksyonèPopòv>
        )}
      </div>
    </div>
  );
};

export default Message;
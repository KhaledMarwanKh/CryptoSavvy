import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: "Hello! I'm your AI assistant at CryptoSavvy. How can I help you analyze cryptocurrencies today?",
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 2,
    role: 'user',
    content: 'Is it a good time to invest in BTC now?',
    timestamp: new Date(Date.now() - 3500000)
  },
  {
    id: 3,
    role: 'assistant',
    content: "Based on current technical analysis, Bitcoin shows positive signals:\n\n✅ Price above major moving averages\n✅ Strong and stable trading volume\n✅ RSI at 62 (positive zone)\n\nHowever, be aware of:\n⚠️ Strong resistance at $68,000\n⚠️ General market volatility\n\nRecommendation: Suitable for medium-term investment with stop loss at $65,000.",
    timestamp: new Date(Date.now() - 3400000)
  }
];

const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const parseContent = (text) => {
  const segments = text.split('\n\n').filter(s => s.trim() !== '');
  const elements = [];

  segments.forEach((segment, index) => {
    // Check for list patterns
    if (segment.startsWith('•') || segment.startsWith('-') || segment.startsWith('*') || /^\d+\./.test(segment.trim())) {
      const isOrdered = /^\d+\./.test(segment.trim());
      const items = segment.split('\n').filter(line => line.trim() !== '');

      const ListTag = isOrdered ? 'ol' : 'ul';

      // Cleanup list items: remove leading markers and trim
      const listItems = items.map((item, i) => {
        const cleanItem = item.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '').trim();

        // Special handling for Emojis/Icons (in this specific mock data context)
        let content = cleanItem
          .replace(/✅/g, '<span class="text-green-400 ml-1">✅</span>')
          .replace(/⚠️/g, '<span class="text-yellow-400 ml-1">⚠️</span>');

        return (
          <li key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: content }} />
        );
      });

      elements.push(<ListTag key={index} className={`pl-5 ${isOrdered ? 'list-decimal' : 'list-disc'} mt-1 mb-2 space-y-1`}>{listItems}</ListTag>);

    } else {
      // Treat as paragraph, converting single newlines to <br/>
      const content = segment.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < segment.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
      elements.push(<p key={index} className="mb-2 last:mb-0">{content}</p>);
    }
  });

  return elements;
};



const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  // Alignment and styling based on role
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleClass = isUser
    ? 'bg-cyan-600 text-white rounded-tr-xl'
    : 'bg-gray-700 text-gray-200 rounded-tl-xl';

  const name = isUser ? 'You' : 'AI Assistant';
  const nameColor = isUser ? 'text-cyan-400' : 'text-gray-400';
  const contentAlign = isUser ? 'text-right' : 'text-left'; // LTR alignment

  return (
    <div className={`flex ${alignment} max-w-full`}>
      <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
        <span className={`text-xs font-medium ${nameColor} mb-0.5 ${contentAlign}`}>
          {name}
        </span>
        <div className={`px-4 py-3 rounded-xl shadow-lg ${bubbleClass} ${contentAlign} whitespace-pre-wrap`}>
          {isUser ? message.content : parseContent(message.content)}
        </div>
        <span className={`text-xs text-gray-500 mt-1 ${contentAlign}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};


const AIChat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messageListRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;

    // 1. Add user message
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    // 2. Simulate AI response
    setTimeout(() => {
      const assistantResponseContent = `Thank you for your question "${content}". Analyzing data...\n\nBased on the latest market analysis, several factors should be considered before making your decision. Please provide more details on your investment strategy (long-term / short-term) for a more accurate analysis.`;
      const newAssistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: assistantResponseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAssistantMessage]);
    }, 1000);
  };

  // Auto-resize textarea logic (using React's ref and state)
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="bg-[#0f121a] text-gray-100 h-screen flex items-center justify-center p-4">
      <div
        id="app"
        className="w-full max-w-3xl h-full md:h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl bg-[#0f1115] border border-gray-700"
        dir="ltr"
      >

        {/* 1. Header */}
        <header className="p-4 bg-[#0f1115] shadow-md flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400">AI Assestant</h1>
        </header>

        {/* 2. Message List Area */}
        <div
          ref={messageListRef}
          id="message-list"
          className="message-list flex-1 p-4 overflow-y-auto space-y-4"
        >
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>

        {/* 3. Input Area */}
        <div className="p-4 bg-[#0f1115] border-t border-gray-700">
          <form onSubmit={handleSend} className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              id="message-input"
              rows="1"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition overflow-hidden"
              style={{ maxHeight: '120px' }}
            />
            <button
              type="submit"
              id="send-button"
              className="bg-cyan-600 text-white p-3 rounded-lg shadow-md hover:bg-cyan-500 transition duration-200 flex items-center justify-center disabled:opacity-50 h-12"
              disabled={!input.trim()}
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

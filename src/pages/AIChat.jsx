import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

// Component: MessageBubble
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'User';
  const bubbleClasses = isUser
    ? 'bg-blue-700 ml-auto rounded-br-none' // Sent messages (User) - WhatsApp green in dark mode
    : 'bg-gray-700 mr-auto rounded-tl-none'; // Received messages (AI) - darker gray

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs sm:max-w-md lg:max-w-xl p-3 rounded-xl shadow-lg ${bubbleClasses}`}>
        <p className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed" style={{ direction: 'rtl' }}>
          {message.text}
        </p>
        <span className={`block text-xs mt-1 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};



const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handler for sending a message
  const handleSend = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // 1. Add user message
    const newMessage = {
      id: Date.now(),
      text: trimmedInput,
      sender: 'User',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // 2. Simulate AI response delay
    setIsTyping(true);
    setTimeout(() => {
      const aiResponseText = `شكراً على استفسارك. لقد قمت بتحليل طلبك، وسأبدأ الآن بصياغة ملخص مفصل لتأثير الذكاء الاصطناعي على التعليم كما طلبت.`;
      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'AI',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f121a] flex items-center justify-center p-4 sm:p-6" style={{ direction: 'ltr' }}>
      {/* Chat Interface Card - Flex layout for sidebar + chat area */}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">

        {/* Messages Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {

            messages.length == 0 ? (
              <div className=''>
                <h1 className='text-4xl font-bold text-center'>Hello <br /> How I Can Assest You Today ?!</h1>
              </div>
            ) : (
              <>
                {
                  messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))
                }
              </>
            )

          }
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <form onSubmit={handleSend} className="p-2 sm:p-4 flex gap-1 sm:gap-3 items-center justify-center">


          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message"
            className="md:flex-1 lg:w-[700px] bg-gray-700 text-gray-100 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-600 transition placeholder-gray-400"
            style={{ direction: 'ltr' }}
            disabled={isTyping}
            autoFocus={!isTyping}
          />

          {/* Send Button */}
          <button
            type="submit"
            className={`p-3 rounded-full ml-2 transition duration-300 ${input.trim() ? 'bg-blue-600 hover:bg-blue-500 text-gray-100' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            disabled={!input.trim() || isTyping}
            aria-label="Send Message"
          >
            {isTyping ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
      </div>
    </div >
  );
};

export default AIChat;
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Minimize2, MessageCircle } from 'lucide-react';
// Sửa dòng này:
// import api from '../config/api'; 

// Thành dòng này (trỏ đúng vào thư mục api/axios.js):
import api from '../api/axios';

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Xin chào! Mình là AI trợ lý ảo FoodNest. Mình có thể giúp gì cho bạn hôm nay? 🤖' }
  ]);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotTyping]);

  // Auto focus
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  // --- HÀM GỌI API (Đã sửa để dùng Axios Instance) ---
  const callChatbotApi = async (userMessage) => {
    try {
      // 1. Dùng api.post thay vì fetch
      // - Không cần điền localhost:8080 (baseURL đã lo)
      // - Không cần điền Header Token (Interceptor request đã lo)
      const response = await api.post('/api/chat', { 
          message: userMessage 
      });

      // 2. Axios trả dữ liệu nằm trong `response.data`
      // Backend trả về map: { "reply": "Nội dung..." }
      return response.data.reply; 

    } catch (error) {
      console.error("Lỗi kết nối Chatbot:", error);
      // Nếu lỗi 401/403/500 thì Interceptor response của bạn đã Toast thông báo rồi.
      // Ở đây mình chỉ trả về text fallback để hiện trong khung chat thôi.
      return "Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại sau nhé! 😔";
    }
  };

  // --- Xử lý gửi tin nhắn (Giữ nguyên) ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isBotTyping) return;

    const userText = chatInput;
    setChatInput('');

    // Hiển thị tin nhắn User
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setIsBotTyping(true);

    // Gọi API
    const botReplyText = await callChatbotApi(userText);

    // Hiển thị tin nhắn Bot
    setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReplyText }]);
    setIsBotTyping(false);
  };

  return (
    <>
      {/* Giữ nguyên phần Style CSS như cũ */}
      <style>{`
        .chatbot-container { position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .chatbot-trigger { width: 60px; height: 60px; background: linear-gradient(135deg, #ff6b6b, #ff4757); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); transition: all 0.3s; border: 2px solid white; }
        .chatbot-trigger:hover { transform: scale(1.1) rotate(5deg); }
        .chat-window { position: absolute; bottom: 80px; right: 0; width: 360px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #eee; animation: popUp 0.3s ease-out; transform-origin: bottom right; }
        @keyframes popUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .chat-header { background: linear-gradient(135deg, #ff6b6b, #ff4757); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; background: #f8f9fa; display: flex; flex-direction: column; gap: 15px; }
        .message { max-width: 80%; padding: 12px 16px; border-radius: 15px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
        .msg-bot { align-self: flex-start; background: white; color: #333; border: 1px solid #e9ecef; border-bottom-left-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .msg-user { align-self: flex-end; background: #ff6b6b; color: white; border-bottom-right-radius: 2px; box-shadow: 0 2px 5px rgba(255, 107, 107, 0.3); }
        .typing-indicator { align-self: flex-start; background: white; padding: 10px 15px; border-radius: 15px; border: 1px solid #e9ecef; display: flex; gap: 5px; width: fit-content; }
        .dot { width: 6px; height: 6px; background: #adb5bd; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
        .dot:nth-child(1) { animation-delay: -0.32s; } .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        .chat-footer { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
        .chat-input { flex: 1; border: 1px solid #ddd; border-radius: 25px; padding: 12px 18px; font-size: 14px; outline: none; background: #f8f9fa; transition: border 0.2s; }
        .chat-input:focus { border-color: #ff6b6b; background: white; }
        .chat-send-btn { width: 42px; height: 42px; background: #ff6b6b; color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
        .chat-send-btn:hover { background: #ff4757; }
        .chat-send-btn:disabled { background: #ccc; cursor: not-allowed; }
        @media (max-width: 480px) { .chat-window { width: 100%; height: 100%; bottom: 0; right: 0; border-radius: 0; } .chatbot-container { bottom: 20px; right: 20px; } }
      `}</style>

      <div className="chatbot-container">
        {isChatOpen ? (
            <div className="chat-window">
                <div className="chat-header">
                    <div style={{fontWeight: 600, display:'flex', alignItems:'center', gap: 10}}>
                        <Bot size={22} /> FoodNest AI
                    </div>
                    <div style={{display:'flex', gap: 10}}>
                        <Minimize2 size={18} style={{cursor:'pointer', opacity: 0.8}} onClick={() => setIsChatOpen(false)}/>
                        <X size={18} style={{cursor:'pointer', opacity: 0.8}} onClick={() => setIsChatOpen(false)}/>
                    </div>
                </div>
                
                <div className="chat-body">
                    {chatMessages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender === 'user' ? 'msg-user' : 'msg-bot'}`}>
                            {msg.text}
                        </div>
                    ))}
                    
                    {isBotTyping && (
                        <div className="typing-indicator">
                            <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form className="chat-footer" onSubmit={handleSendMessage}>
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="chat-input" 
                        placeholder="Nhập tin nhắn..." 
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="chat-send-btn" disabled={!chatInput.trim() || isBotTyping}>
                        <Send size={18}/>
                    </button>
                </form>
            </div>
        ) : (
            <div className="chatbot-trigger" onClick={() => setIsChatOpen(true)}>
                <MessageCircle size={30} color="white" strokeWidth={2.5} />
            </div>
        )}
      </div>
    </>
  );
};

export default Chatbot;
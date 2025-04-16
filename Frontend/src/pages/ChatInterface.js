import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';


const baseURL = 'http://localhost:5001/api' || ''
const ChatInterface = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: 'Welcome! Ask me anything about GWAS studies, genetic variants, or phenotypes.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Properly encode the question parameter in the URL
      // const response = await fetch(`${baseURL}/askgpt?question=${encodeURIComponent(input)}`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   }
      // });
      const response = await fetch(`/api/askgpt?question=${encodeURIComponent(input)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.explanation,
        sqlQuery: data.sqlQuery,
        results: data.results
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-white" size={24} />
            <h2 className="text-lg font-semibold text-white">PLATLAS AI</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.sqlQuery && (
                  <div className="mt-2 p-2 bg-gray-800 text-gray-200 rounded text-xs font-mono">
                    {message.sqlQuery}
                  </div>
                )}
                {message.results && message.results.length > 0 && (
                  <div className="mt-2 overflow-x-auto">
                    <div className="text-xs font-medium mb-1">Top Results:</div>
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr>
                          {Object.keys(message.results[0]).map(key => (
                            <th key={key} className="px-2 py-1 text-left">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.results.map((result, idx) => (
                          <tr key={idx}>
                            {Object.values(result).map((value, vidx) => (
                              <td key={vidx} className="px-2 py-1">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about GWAS studies, variants, or phenotypes..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
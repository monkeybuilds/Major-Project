import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiOutlinePaperAirplane, HiOutlineDocumentText } from 'react-icons/hi';
import Sidebar from '../components/Sidebar';
import api from '../api';

function QueryPage() {
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            text: "Hello! I'm **Gyan Vault AI**. Ask me anything about your uploaded documents, and I'll find the answer for you. 📚",
            sources: [],
        }
    ]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef();
    const inputRef = useRef();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const userMessage = question.trim();
        setQuestion('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const res = await api.post('/query/ask', { question: userMessage });
            setMessages(prev => [...prev, {
                type: 'ai',
                text: res.data.answer,
                sources: res.data.sources,
            }]);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to get answer. Make sure you have uploaded documents.';
            setMessages(prev => [...prev, {
                type: 'ai',
                text: `⚠️ ${errorMsg}`,
                sources: [],
            }]);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const renderMessageText = (text) => {
        // Simple markdown-like rendering for bold text
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content query-page">
                <div className="page-header">
                    <h1 className="page-title">Ask AI</h1>
                    <p className="page-subtitle">Ask questions about your uploaded documents</p>
                </div>

                {/* Chat Area */}
                <div className="chat-container">
                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.type}`}>
                                <div className="message-avatar">
                                    {msg.type === 'ai' ? '🤖' : '👤'}
                                </div>
                                <div className="message-content">
                                    <p className="message-text">{renderMessageText(msg.text)}</p>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="message-sources">
                                            <p className="sources-label">📖 Sources:</p>
                                            {msg.sources.map((src, sIdx) => (
                                                <div key={sIdx} className="source-item">
                                                    <HiOutlineDocumentText size={14} />
                                                    <span>Page {src.page_number}</span>
                                                    <span className="source-preview">{src.text_preview}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-message ai">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form className="chat-input-area" onSubmit={handleAsk}>
                        <input
                            ref={inputRef}
                            type="text"
                            className="chat-input"
                            placeholder="Ask a question about your documents..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={!question.trim() || loading}
                        >
                            <HiOutlinePaperAirplane size={20} />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default QueryPage;

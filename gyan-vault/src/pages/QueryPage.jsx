import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiOutlinePaperAirplane, HiOutlineDocumentText, HiOutlinePlus, HiOutlineTrash, HiOutlineChatAlt2, HiOutlineChevronLeft } from 'react-icons/hi';
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
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const chatEndRef = useRef();
    const inputRef = useRef();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/chat/sessions');
            setSessions(res.data.sessions);
        } catch { /* silently fail */ }
    };

    const loadSession = async (sid) => {
        try {
            const res = await api.get(`/chat/sessions/${sid}`);
            setSessionId(sid);
            const loadedMessages = res.data.messages.map(m => ({
                type: m.role === 'user' ? 'user' : 'ai',
                text: m.content,
                sources: m.sources || [],
            }));
            setMessages(loadedMessages.length ? loadedMessages : [{
                type: 'ai',
                text: "This session is empty. Ask a question!",
                sources: [],
            }]);
            setShowHistory(false);
        } catch {
            toast.error('Failed to load chat session');
        }
    };

    const startNewChat = () => {
        setSessionId(null);
        setMessages([{
            type: 'ai',
            text: "Hello! I'm **Gyan Vault AI**. Ask me anything about your uploaded documents 📚",
            sources: [],
        }]);
        setShowHistory(false);
    };

    const deleteSession = async (sid, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/chat/sessions/${sid}`);
            setSessions(sessions.filter(s => s.id !== sid));
            if (sessionId === sid) startNewChat();
            toast.success('Session deleted');
        } catch {
            toast.error('Failed to delete session');
        }
    };

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const userMessage = question.trim();
        setQuestion('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const payload = { question: userMessage };
            if (sessionId) payload.session_id = sessionId;

            const res = await api.post('/query/ask', payload);

            if (!sessionId) {
                setSessionId(res.data.session_id);
                fetchSessions(); // Refresh session list
            }

            setMessages(prev => [...prev, {
                type: 'ai',
                text: res.data.answer,
                sources: res.data.sources,
            }]);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to get answer.';
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
                <div className="page-header query-header">
                    <div>
                        <h1 className="page-title">Ask AI</h1>
                        <p className="page-subtitle">
                            {sessionId ? 'Follow-up questions carry context' : 'Start a new conversation'}
                        </p>
                    </div>
                    <div className="query-actions">
                        <button className="icon-btn" onClick={() => setShowHistory(!showHistory)} title="Chat History">
                            <HiOutlineChatAlt2 size={20} />
                            <span>History</span>
                            {sessions.length > 0 && <span className="badge">{sessions.length}</span>}
                        </button>
                        <button className="icon-btn new-chat-btn" onClick={startNewChat} title="New Chat">
                            <HiOutlinePlus size={20} />
                            <span>New Chat</span>
                        </button>
                    </div>
                </div>

                <div className="query-layout">
                    {/* Chat History Panel */}
                    {showHistory && (
                        <div className="chat-history-panel">
                            <div className="history-header">
                                <h3>Chat History</h3>
                                <button className="close-history" onClick={() => setShowHistory(false)}>
                                    <HiOutlineChevronLeft size={18} />
                                </button>
                            </div>
                            {sessions.length === 0 ? (
                                <p className="history-empty">No past conversations</p>
                            ) : (
                                <div className="history-list">
                                    {sessions.map(s => (
                                        <div
                                            key={s.id}
                                            className={`history-item ${sessionId === s.id ? 'active' : ''}`}
                                            onClick={() => loadSession(s.id)}
                                        >
                                            <div className="history-item-info">
                                                <p className="history-item-title">{s.title}</p>
                                                <p className="history-item-meta">{s.message_count} messages</p>
                                            </div>
                                            <button className="history-delete" onClick={(e) => deleteSession(s.id, e)}>
                                                <HiOutlineTrash size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Container */}
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
                </div>
            </main>
        </div>
    );
}

export default QueryPage;

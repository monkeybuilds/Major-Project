import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlineCloudUpload, HiOutlineChatAlt2, HiOutlineCollection } from 'react-icons/hi';
import Sidebar from '../components/Sidebar';
import api from '../api';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('gyan_vault_user') || '{}');
    const [stats, setStats] = useState({ totalDocs: 0, readyDocs: 0, totalChunks: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/documents/');
            const docs = res.data.documents;
            setStats({
                totalDocs: docs.length,
                readyDocs: docs.filter(d => d.status === 'ready').length,
                totalChunks: docs.reduce((sum, d) => sum + d.chunk_count, 0),
            });
        } catch {
            // Silently fail on dashboard load
        }
    };

    const quickActions = [
        {
            title: 'Upload Document',
            description: 'Upload a PDF to your knowledge base',
            icon: <HiOutlineCloudUpload size={32} />,
            color: 'from-blue-500 to-cyan-500',
            onClick: () => navigate('/upload'),
        },
        {
            title: 'My Library',
            description: 'Browse your uploaded documents',
            icon: <HiOutlineCollection size={32} />,
            color: 'from-purple-500 to-pink-500',
            onClick: () => navigate('/library'),
        },
        {
            title: 'Ask AI',
            description: 'Query your documents with AI',
            icon: <HiOutlineChatAlt2 size={32} />,
            color: 'from-emerald-500 to-teal-500',
            onClick: () => navigate('/query'),
        },
    ];

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        Welcome back, <span className="text-gradient">{user.name || 'User'}</span> 👋
                    </h1>
                    <p className="welcome-subtitle">
                        Your AI-powered knowledge base is ready. Upload documents and ask questions.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon bg-blue-500/20 text-blue-400">
                            <HiOutlineDocumentText size={24} />
                        </div>
                        <div>
                            <p className="stat-value">{stats.totalDocs}</p>
                            <p className="stat-label">Total Documents</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon bg-green-500/20 text-green-400">
                            <HiOutlineDocumentText size={24} />
                        </div>
                        <div>
                            <p className="stat-value">{stats.readyDocs}</p>
                            <p className="stat-label">Ready for Queries</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon bg-purple-500/20 text-purple-400">
                            <HiOutlineCollection size={24} />
                        </div>
                        <div>
                            <p className="stat-value">{stats.totalChunks}</p>
                            <p className="stat-label">Knowledge Chunks</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="section-title">Quick Actions</h2>
                <div className="actions-grid">
                    {quickActions.map((action) => (
                        <div
                            key={action.title}
                            className="action-card"
                            onClick={action.onClick}
                        >
                            <div className={`action-icon bg-gradient-to-br ${action.color}`}>
                                {action.icon}
                            </div>
                            <h3 className="action-title">{action.title}</h3>
                            <p className="action-desc">{action.description}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;

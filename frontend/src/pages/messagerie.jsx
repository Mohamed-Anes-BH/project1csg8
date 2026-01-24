import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';

function Messagerie() {
    const [conversations, setConversations] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};

    // Fetch Conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await messageService.getConversations();
                setConversations(data || []);
                if (data && data.length > 0) {
                    setActiveChatId(data[0].id);
                    setActiveChatUser(data[0].other_user);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchConversations();
    }, []);

    // Fetch Messages for active chat
    useEffect(() => {
        if (!activeChatId) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                // Determine active user if not set (e.g. if we set ID manually later)
                const conversation = conversations.find(c => c.id === activeChatId);
                if (conversation) setActiveChatUser(conversation.other_user);

                const data = await messageService.getMessages(activeChatId);
                setMessages(data.results ? data.results.reverse() : []); // Reverse to show oldest first at top usually, or depends on UI
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();

        // Optional: Polling for new messages
        const interval = setInterval(fetchMessages, 10000); // 10 seconds
        return () => clearInterval(interval);

    }, [activeChatId, conversations]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeChatId) return;

        try {
            const tempId = Date.now();
            // Optimistic update
            const newMessage = {
                id: tempId,
                sender_id: currentUser.id, // Assuming 'me' logic uses ID comparison
                content: messageInput,
                created_at: new Date().toISOString(),
                is_read: false
            };
            setMessages(prev => [...prev, newMessage]);
            setMessageInput('');

            await messageService.sendMessage(activeChatId, messageInput);

            // Refresh real messages to get correct ID and state
            const data = await messageService.getMessages(activeChatId);
            if (data.results) setMessages(data.results.reverse());

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Erreur lors de l'envoi du message.");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isMe = (senderId) => {
        return senderId === currentUser.id;
    };

    return (
        <div className="flex h-[calc(100vh-74px)] bg-black text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 flex flex-col border-r border-[#3A362D] bg-[#26231D]">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Messagerie</h1>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pb-4">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher une conversation..."
                            className="w-full bg-black border border-[#3A362D] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F9B134] transition-colors"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F9B134]"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <p className="text-gray-500 text-center py-10 text-sm">Aucune conversation</p>
                    ) : (
                        conversations.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${activeChatId === chat.id
                                    ? 'bg-[#3A362D]/50 border-l-2 border-[#F9B134]'
                                    : 'hover:bg-[#3A362D]/30 border-l-2 border-transparent'
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-[#3A362D] flex items-center justify-center text-[#F9B134] font-bold text-sm border border-[#4A463D]">
                                        {chat.other_user?.avatar ? (
                                            <img src={chat.other_user.avatar} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            getInitials(chat.other_user?.first_name ? `${chat.other_user.first_name} ${chat.other_user.last_name}` : chat.other_user?.username)
                                        )}
                                    </div>
                                    {/* Online indicator would come from backend or websocket */}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-white' : 'text-gray-200'}`}>
                                            {chat.other_user ? (chat.other_user.first_name ? `${chat.other_user.first_name} ${chat.other_user.last_name}` : chat.other_user.username) : "Utilisateur Inconnu"}
                                        </h3>
                                        <span className={`text-xs ${chat.unread_count > 0 ? 'text-[#F9B134] font-medium' : 'text-gray-500'}`}>
                                            {chat.last_message ? formatTime(chat.last_message.created_at) : ''}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${chat.unread_count > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                                        {chat.last_message ? chat.last_message.content : 'Nouvelle conversation'}
                                    </p>
                                </div>

                                {chat.unread_count > 0 && (
                                    <div className="w-2 h-2 bg-[#F9B134] rounded-full mt-2 flex-shrink-0"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-black relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#F9B134 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {activeChatId && activeChatUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-[#3A362D] flex items-center justify-between px-6 bg-black/95 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-[#3A362D] flex items-center justify-center text-[#F9B134] font-bold text-sm border border-[#4A463D]">
                                        {getInitials(activeChatUser.first_name ? `${activeChatUser.first_name} ${activeChatUser.last_name}` : activeChatUser.username)}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">
                                        {activeChatUser.first_name ? `${activeChatUser.first_name} ${activeChatUser.last_name}` : activeChatUser.username}
                                    </h2>
                                    {/* <p className="text-xs text-green-500">En ligne</p> */}
                                </div>
                            </div>

                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-0 flex flex-col-reverse">
                            {/* Note: flex-col-reverse helps keep scroll at bottom if we reverse messages array? 
                           Actually standard is flex-col and scroll to bottom. 
                           Let's stick to standard flow: oldest top, newest bottom. 
                           So messages array should be chronological (Oldest -> Newest).
                           My .reverse() in fetchMessages might have been wrong depending on API Sort.
                           Usually API returns newest first for pagination. 
                           If API returns Newest First (Desc), we reverse to show Oldest First (Asc) in top-down view.
                           So yes, .reverse() is correct.
                           And we default scroll to bottom.
                           For simplicity, I will render them normally.
                        */}
                            <div className="flex-1" />
                            {/* Spacer to push messages down if few */}

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${isMe(msg.sender_id) || isMe(msg.sender?.id) ? 'justify-end' : 'justify-start'}`}>
                                    {!(isMe(msg.sender_id) || isMe(msg.sender?.id)) && (
                                        <div className="w-8 h-8 rounded-full bg-[#3A362D] flex-shrink-0 mr-3 flex items-center justify-center text-[#F9B134] text-xs font-bold border border-[#4A463D] mt-auto">
                                            {getInitials(activeChatUser.first_name ? `${activeChatUser.first_name} ${activeChatUser.last_name}` : activeChatUser.username)}
                                        </div>
                                    )}
                                    <div className={`max-w-[70%] ${isMe(msg.sender_id) || isMe(msg.sender?.id) ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div
                                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${isMe(msg.sender_id) || isMe(msg.sender?.id)
                                                ? 'bg-[#F9B134] text-black rounded-tr-none'
                                                : 'bg-[#26231D] border border-[#3A362D] text-gray-200 rounded-tl-none'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 px-1">
                                            <span className="text-[10px] text-gray-500">{formatTime(msg.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black border-t border-[#3A362D] z-10">
                            <div className="max-w-4xl mx-auto relative">
                                <div className="bg-[#26231D] border border-[#3A362D] rounded-full flex items-center px-2 py-2 shadow-lg">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Écrivez votre message..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-500 px-3"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2.5 bg-[#F9B134] text-black rounded-full hover:bg-[#e5a02a] transition-colors shadow-md"
                                    >
                                        <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Sélectionnez une conversation pour commencer
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messagerie;

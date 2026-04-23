"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Paperclip,
  User,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Search,
  Sparkles,
  Zap,
  Download,
  Star,
  Archive,
  Pin,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

// Available agents for chat
const availableAgents = [
  { id: '1', name: 'General Assistant', type: 'assistant', status: 'online', avatar: '🤖' },
  { id: '2', name: 'Code Helper', type: 'coding', status: 'online', avatar: '💻' },
  { id: '3', name: 'Data Analyst', type: 'analytics', status: 'online', avatar: '📊' },
  { id: '4', name: 'Research Agent', type: 'research', status: 'busy', avatar: '🔬' },
  { id: '5', name: 'Creative Writer', type: 'creative', status: 'offline', avatar: '✍️' },
];

// Sample conversations
const conversations = [
  { id: '1', title: 'API Integration Help', agent: 'Code Helper', lastMessage: 'Here\'s the code example...', time: '2 min ago', unread: 2, pinned: true },
  { id: '2', title: 'Data Analysis Request', agent: 'Data Analyst', lastMessage: 'The analysis shows...', time: '1 hour ago', unread: 0, pinned: false },
  { id: '3', title: 'Project Planning', agent: 'General Assistant', lastMessage: 'Let me help you plan...', time: '3 hours ago', unread: 0, pinned: false },
  { id: '4', title: 'Research Task', agent: 'Research Agent', lastMessage: 'I found these sources...', time: 'Yesterday', unread: 0, pinned: false },
];

// Sample messages
const initialMessages = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI assistant. How can I help you today?',
    timestamp: '10:00 AM',
    agent: 'General Assistant',
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you help me understand how to implement a REST API with authentication?',
    timestamp: '10:01 AM',
  },
  {
    id: '3',
    role: 'assistant',
    content: `Of course! I'll help you understand REST API implementation with authentication. Here's a comprehensive overview:

## REST API with Authentication

### 1. Choose an Authentication Method

**JWT (JSON Web Tokens)** - Most popular for modern APIs:
- Stateless authentication
- Contains encoded user data
- Self-contained tokens

**OAuth 2.0** - For third-party access:
- Industry standard for authorization
- Supports multiple grant types
- Great for social login

### 2. Basic Implementation

\`\`\`javascript
// JWT Authentication Example
const jwt = require('jsonwebtoken');

// Generate token
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
\`\`\`

Would you like me to explain any specific part in more detail?`,
    timestamp: '10:02 AM',
    agent: 'Code Helper',
  },
  {
    id: '4',
    role: 'user',
    content: 'That\'s helpful! Can you show me how to handle refresh tokens?',
    timestamp: '10:05 AM',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(availableAgents[0]);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a simulated response. In a real application, this would be connected to your AI backend for intelligent responses.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agent: selectedAgent.name,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[calc(100vh-8rem)] flex gap-6"
      >
        {/* Sidebar - Conversations */}
        <Card className="w-80 shrink-0 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chats
              </CardTitle>
              <Button size="icon" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedConversation?.id === conv.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-lg">
                        {availableAgents.find(a => a.name === conv.agent)?.avatar || '🤖'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate flex items-center gap-1">
                          {conv.pinned && <Pin className="h-3 w-3 text-primary" />}
                          {conv.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge className="h-5 px-1.5">{conv.unread}</Badge>
                    )}
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-lg">{selectedAgent.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedAgent.name}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        selectedAgent.status === 'online' && "text-green-500 border-green-500/30",
                        selectedAgent.status === 'busy' && "text-yellow-500 border-yellow-500/30",
                        selectedAgent.status === 'offline' && "text-muted-foreground"
                      )}
                    >
                      {selectedAgent.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{selectedAgent.type} agent</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedAgent.id}
                  onValueChange={(id) => setSelectedAgent(availableAgents.find(a => a.id === id) || selectedAgent)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Switch agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <span>{agent.avatar}</span>
                          <span>{agent.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      Star conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export chat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {message.role === 'assistant' ? (
                          <AvatarFallback className="text-sm bg-primary/10">
                            {selectedAgent.avatar}
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-muted">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className={cn(
                        "group max-w-[70%] space-y-1",
                        message.role === 'user' && "items-end"
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5",
                          message.role === 'assistant'
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground"
                        )}>
                          <div className={cn(
                            "prose prose-sm dark:prose-invert max-w-none",
                            message.role === 'user' && "prose-invert"
                          )}>
                            {message.role === 'assistant' ? (
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code: (props) => {
                                    const { className, children, node: _node, ref: _ref, ...rest } = props;
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !match && !String(children).includes('\n');
                                    return !isInline && match ? (
                                      <SyntaxHighlighter
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        style={oneDark as any}
                                        language={match[1]}
                                        PreTag="div"
                                        className="rounded-md text-sm"
                                        {...rest}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...rest}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                  li: ({ children }) => <li className="ml-4">{children}</li>,
                                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                  em: ({ children }) => <em className="italic">{children}</em>,
                                  blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-2">{children}</blockquote>
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                          message.role === 'user' && "flex-row-reverse"
                        )}>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          {message.role === 'assistant' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => copyToClipboard(message.id, message.content)}
                                    >
                                      {copied === message.id ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm bg-primary/10">
                        {selectedAgent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="h-2 w-2 rounded-full bg-muted-foreground"
                        />
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="h-2 w-2 rounded-full bg-muted-foreground"
                        />
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="h-2 w-2 rounded-full bg-muted-foreground"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4 shrink-0">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button onClick={handleSend} size="lg" className="h-[60px] gap-2">
                <Send className="h-5 w-5" />
                Send
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                GPT-4 Turbo
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Zap className="h-3 w-3" />
                Fast mode
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
}

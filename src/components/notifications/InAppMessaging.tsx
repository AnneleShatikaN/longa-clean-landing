
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare, User } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

type MessageWithUser = {
  id: string;
  booking_id: string | null;
  sender_id: string;
  recipient_id: string;
  message_type: string;
  content: string;
  attachments: any;
  read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
  recipient?: {
    full_name: string;
    avatar_url: string | null;
  };
};

export const InAppMessaging = () => {
  const { messages, sendMessage } = useNotifications();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Type the messages properly
  const typedMessages = messages as MessageWithUser[];

  // Group messages by conversation (booking or direct message)
  const conversations = typedMessages.reduce((acc, message) => {
    const key = message.booking_id || `direct-${[message.sender_id, message.recipient_id].sort().join('-')}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(message);
    return acc;
  }, {} as Record<string, MessageWithUser[]>);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Extract recipient from conversation
    const conversation = conversations[selectedConversation];
    if (!conversation.length) return;

    const lastMessage = conversation[0];
    const recipientId = lastMessage.sender_id === user?.id 
      ? lastMessage.recipient_id 
      : lastMessage.sender_id;

    await sendMessage(recipientId, newMessage, lastMessage.booking_id);
    setNewMessage('');
  };

  const getConversationTitle = (key: string, conversation: MessageWithUser[]) => {
    if (key.startsWith('direct-')) {
      const otherUser = conversation.find(m => m.sender_id !== user?.id);
      return otherUser?.sender?.full_name || 'Unknown User';
    }
    return `Booking Conversation`;
  };

  const getLastMessage = (conversation: MessageWithUser[]) => {
    return conversation.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
      {/* Conversation List */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {Object.entries(conversations).length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                Object.entries(conversations).map(([key, conversation]) => {
                  const lastMessage = getLastMessage(conversation);
                  const unreadCount = conversation.filter(
                    m => !m.read && m.recipient_id === user?.id
                  ).length;
                  
                  return (
                    <div
                      key={key}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === key ? 'bg-purple-50 border-purple-200' : ''
                      }`}
                      onClick={() => setSelectedConversation(key)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={lastMessage.sender?.avatar_url || ''} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {getConversationTitle(key, conversation)}
                            </h4>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {lastMessage.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Conversation View */}
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedConversation 
                ? getConversationTitle(selectedConversation, conversations[selectedConversation] || [])
                : 'Select a conversation'
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col">
            {selectedConversation ? (
              <>
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {conversations[selectedConversation]
                      ?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 resize-none"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

const ChatList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch users from API or database
    const fetchUsers = async () => {
      // Replace with actual API call
      const mockUsers = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Mike Johnson' },
      ];
      setUsers(mockUsers);
    };

    fetchUsers();
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: 'user', // Replace with actual user ID
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chat</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-[400px] space-y-2">
            {/* User List */}
            <div className="h-[100px] overflow-y-auto border-b">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-2 hover:bg-muted cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2">{user.name}</span>
                </div>
              ))}
            </div>

            {/* Chat Messages */}
            {selectedUser && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="max-w-[80%] px-4 py-2 rounded-lg text-sm">
                      {message.content}
                      <span className="block text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message Input */}
            {selectedUser && (
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  />
                  <Button onClick={handleSendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatList;

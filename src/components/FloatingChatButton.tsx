import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  unreadCount: number;
}

interface FloatingChatButtonProps {
  onOpenChat: (conversation: Conversation) => void;
  conversations?: Conversation[];
}

const FloatingChatButton = ({ onOpenChat, conversations = [] }: FloatingChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat list popup */}
      {isOpen && (
        <Card className="fixed bottom-16 sm:bottom-24 right-4 w-[calc(100vw-2rem)] sm:w-80 max-w-md shadow-2xl z-50 animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Messages</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 min-h-[44px] min-w-[44px]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 max-h-[50vh] sm:max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      onOpenChat(conversation);
                      setIsOpen(false);
                    }}
                    className="w-full p-3 sm:p-4 hover:bg-muted/50 transition-colors text-left min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src={conversation.avatar} loading="lazy" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {conversation.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold truncate">{conversation.name}</p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 ml-2">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 sm:bottom-6 right-4 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl z-40 min-h-[44px] min-w-[44px]",
          "bg-gradient-to-r from-[#FF4D6D] to-[#5A189A] hover:from-[#FF4D6D]/90 hover:to-[#5A189A]/90",
          "hover:scale-110 transition-all duration-200 hover-glow"
        )}
        size="icon"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        {conversations.some(c => c.unreadCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
          </span>
        )}
      </Button>
    </>
  );
};

export default FloatingChatButton;

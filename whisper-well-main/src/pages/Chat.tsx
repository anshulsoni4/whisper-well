import { Header } from "@/components/header";
import { ChatInterface } from "@/components/chat-interface";
import { handleChatRequest } from "@/services/chat-service";

const Chat = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <ChatInterface onSendMessage={handleChatRequest} />
    </div>
  );
};

export default Chat;

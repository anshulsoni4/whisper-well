
import { Header } from "@/components/header";
import { ChatInterface } from "@/components/chat-interface";

const Chat = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container pt-16">
        <h1 className="text-2xl font-bold mb-6 font-poppins text-center">Journal</h1>
        <ChatInterface />
      </main>
    </div>
  );
};

export default Chat;

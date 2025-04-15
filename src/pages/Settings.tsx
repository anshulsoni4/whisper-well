
import { Header } from "@/components/header";
import { SettingsForm } from "@/components/settings-form";

const Settings = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container pt-16">
        <h1 className="text-2xl font-bold mb-6 font-poppins text-center">Settings</h1>
        <SettingsForm />
      </main>
    </div>
  );
};

export default Settings;

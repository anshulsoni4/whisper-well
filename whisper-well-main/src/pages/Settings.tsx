
import { Header } from "@/components/header";
import { SettingsForm } from "@/components/settings-form";

const Settings = () => {
  return (
    <div className="min-h-screen pb-8">
      <Header />
      <div className="container max-w-4xl pt-20 px-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
          <SettingsForm />
        </div>
      </div>
    </div>
  );
};

export default Settings;

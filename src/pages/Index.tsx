import { useState } from 'react';
import TodayScreen from '@/components/echos/TodayScreen';
import BottomNav from '@/components/echos/BottomNav';

const PlaceholderTab = ({ name }: { name: string }) => (
  <div className="flex min-h-screen items-center justify-center pb-24">
    <div className="text-center">
      <h2 className="text-headline">{name}</h2>
      <p className="text-subhead mt-2">Coming soon</p>
    </div>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="min-h-screen bg-background">
      {activeTab === 'today' && <TodayScreen />}
      {activeTab === 'tasks' && <PlaceholderTab name="Tasks" />}
      {activeTab === 'focus' && <PlaceholderTab name="Focus" />}
      {activeTab === 'education' && <PlaceholderTab name="Education" />}
      {activeTab === 'analytics' && <PlaceholderTab name="Analytics" />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;

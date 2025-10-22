import React, { useState, useEffect } from 'react';
import { ArrowRight, Mic } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface RoutePlannerProps {
  onPlanRoute: (origin: string, destination: string) => void;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ onPlanRoute }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);

  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && activeInput) {
      if (activeInput === 'origin') {
        setOrigin(transcript);
      } else if (activeInput === 'destination') {
        setDestination(transcript);
      }
      setActiveInput(null);
    }
  }, [transcript, activeInput]);

  const handlePlan = () => {
    if (origin && destination) {
      onPlanRoute(origin, destination);
    }
  };

  const handleMicClick = (field: 'origin' | 'destination') => {
    if (isListening) {
      stopListening();
      setActiveInput(null);
    } else {
      setActiveInput(field);
      startListening();
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Origin"
          className="w-full p-2 pr-10 bg-white/10 rounded-md text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <button onClick={() => handleMicClick('origin')} className="absolute inset-y-0 right-0 px-3 flex items-center">
          <Mic className={`w-5 h-5 ${activeInput === 'origin' && isListening ? 'text-cyan-400' : 'text-white/40'}`} />
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination"
          className="w-full p-2 pr-10 bg-white/10 rounded-md text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <button onClick={() => handleMicClick('destination')} className="absolute inset-y-0 right-0 px-3 flex items-center">
          <Mic className={`w-5 h-5 ${activeInput === 'destination' && isListening ? 'text-cyan-400' : 'text-white/40'}`} />
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handlePlan}
        className="w-full flex items-center justify-center gap-2 p-2 bg-cyan-500 hover:bg-cyan-400 rounded-md text-black font-bold"
      >
        Plan Route <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default RoutePlanner;

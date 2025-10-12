import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTripStore } from '@/store/tripStore';
import { mockAIResponse } from '@/lib/mockApi';
import { toast } from 'sonner';

export default function Plan() {
  const navigate = useNavigate();
  const { tripData, setTripData, chatMessages, addChatMessage } = useTripStore();
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setTripData({ [field]: value });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    addChatMessage({ role: 'user', content: chatInput });
    setChatInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = mockAIResponse(chatInput);
      addChatMessage({ role: 'assistant', content: response });
      setIsLoading(false);
    }, 1000);
  };

  const handleSearch = () => {
    if (!tripData.destination || !tripData.startDate || !tripData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Searching for the best options...');
    navigate('/results');
  };

  const examplePrompts = [
    'What are the must-see attractions?',
    'Best local restaurants nearby',
    'How\'s the weather during my dates?',
    'Family-friendly activities',
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Plan Your Perfect Trip
          </h1>
          <p className="text-muted-foreground">Tell us your preferences and chat with our AI agent for personalized recommendations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trip Form */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Fill in your travel information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Select
                  value={tripData.destination}
                  onValueChange={(value) => handleInputChange('destination', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Egypt">Egypt</SelectItem>
                    <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelers">Number of Travelers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="travelers"
                    type="number"
                    min="1"
                    className="pl-10"
                    value={tripData.travelers}
                    onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select
                  value={tripData.budget}
                  onValueChange={(value) => handleInputChange('budget', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget ($-$$)</SelectItem>
                    <SelectItem value="medium">Medium ($$-$$$)</SelectItem>
                    <SelectItem value="luxury">Luxury ($$$$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripStyle">Trip Style</Label>
                <Select
                  value={tripData.tripStyle}
                  onValueChange={(value) => handleInputChange('tripStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leisure">Leisure</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Any specific preferences or requirements..."
                  value={tripData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSearch}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Search Options
              </Button>
            </CardContent>
          </Card>

          {/* AI Chat Interface */}
          <Card className="flex flex-col animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Chat with {tripData.destination || 'AI'} Agent
              </CardTitle>
              <CardDescription>Ask anything about your destination</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Example Prompts */}
              {chatMessages.length === 0 && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm text-muted-foreground">Try asking:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setChatInput(prompt)}
                        className="p-3 text-left text-sm bg-gradient-card rounded-lg border border-border hover:border-primary transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-2xl">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !chatInput.trim()}
                  size="icon"
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

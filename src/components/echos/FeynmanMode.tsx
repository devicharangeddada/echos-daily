import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { fadeInUp, hoverLift } from '@/lib/motion';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const FeynmanMode = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Welcome to Feynman Mode! Explain a concept to me like I\'m a complete beginner. I\'ll ask questions if something doesn\'t make sense.',
    },
  ]);
  const [input, setInput] = useState('');
  const [masteryScore, setMasteryScore] = useState(100);

  const analyzeExplanation = useCallback(async (text: string) => {
    // Simple heuristic analysis (offline)
    const words = text.toLowerCase().split(/\s+/);
    const complexWords = ['therefore', 'however', 'consequently', 'moreover', 'furthermore', 'additionally'];
    const simpleWords = ['because', 'so', 'and', 'but', 'or', 'like', 'example'];

    let complexity = 0;
    let simplicity = 0;

    words.forEach(word => {
      if (complexWords.includes(word)) complexity++;
      if (simpleWords.includes(word)) simplicity++;
    });

    const avgSentenceLength = text.split(/[.!?]+/).reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / text.split(/[.!?]+/).length;

    // Lower score if too complex
    if (complexity > simplicity || avgSentenceLength > 15) {
      setMasteryScore(prev => Math.max(0, prev - 10));
      return "That sounds a bit complex. Can you explain it like I'm 5 years old? What does this really mean in simple terms?";
    }

    // Check for gaps (very basic)
    if (text.length < 50) {
      setMasteryScore(prev => Math.max(0, prev - 5));
      return "That's a good start, but can you give me more details? Why is this important?";
    }

    setMasteryScore(prev => Math.min(100, prev + 5));
    return "That makes sense! Can you give me an example to make sure I understand?";
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(async () => {
      const aiResponse = await analyzeExplanation(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  }, [input, analyzeExplanation]);

  return (
    <div className="mx-auto max-w-4xl px-5 pb-28 pt-14">
      <motion.div {...fadeInUp} className="mb-8">
        <p className="text-subhead uppercase tracking-widest">Feynman Technique</p>
        <h1 className="text-headline mt-1">Teach the AI</h1>
        <p className="text-xs text-muted-foreground mt-1">Mastery Score: {masteryScore}%</p>
      </motion.div>

      <motion.div {...fadeInUp} className="glass-card p-6 mb-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'ai' ? 'bg-accent text-black' : 'bg-secondary'
                }`}>
                  {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-accent text-black'
                    : 'glass-card'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div {...fadeInUp} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Explain a concept..."
          className="flex-1 p-3 glass-card focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <motion.button
          {...hoverLift}
          onClick={sendMessage}
          disabled={!input.trim()}
          className="p-3 glass-card hover:bg-accent/10 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FeynmanMode;
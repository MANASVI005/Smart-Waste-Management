import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";
import wasteSegregationImage from "@/assets/waste-segregation.png";

interface WasteItem {
  id: number;
  name: string;
  type: "wet" | "dry" | "hazardous";
  emoji: string;
}

interface SegregationGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const SegregationGame = ({ isOpen, onClose }: SegregationGameProps) => {
  const [feedback, setFeedback] = useState<string>("");
  const [score, setScore] = useState(0);
  const [draggedItem, setDraggedItem] = useState<WasteItem | null>(null);
  
  const wasteItems: WasteItem[] = [
    { id: 1, name: "Apple Core", type: "wet", emoji: "🍎" },
    { id: 2, name: "Plastic Bottle", type: "dry", emoji: "🍼" },
    { id: 3, name: "Used Battery", type: "hazardous", emoji: "🔋" },
    { id: 4, name: "Cardboard Box", type: "dry", emoji: "📦" },
    { id: 5, name: "Egg Shells", type: "wet", emoji: "🥚" },
    { id: 6, name: "Paint Can", type: "hazardous", emoji: "🎨" },
    { id: 7, name: "Newspaper", type: "dry", emoji: "📰" },
    { id: 8, name: "Banana Peel", type: "wet", emoji: "🍌" },
  ];

  const [availableItems, setAvailableItems] = useState<WasteItem[]>(wasteItems);

  const handleDragStart = (item: WasteItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (binType: string) => {
    if (!draggedItem) return;

    const isCorrect = draggedItem.type === binType;
    
    if (isCorrect) {
      setFeedback(`✅ Correct! ${draggedItem.name} goes in ${binType} waste.`);
      setScore(score + 10);
      setAvailableItems(items => items.filter(item => item.id !== draggedItem.id));
    } else {
      setFeedback(`❌ Oops! ${draggedItem.name} should go in ${draggedItem.type} waste bin.`);
    }

    setTimeout(() => setFeedback(""), 3000);
    setDraggedItem(null);
  };

  const resetGame = () => {
    setAvailableItems(wasteItems);
    setScore(0);
    setFeedback("");
  };

  const bins = [
    {
      type: "wet",
      title: "Wet Waste",
      description: "Organic & Biodegradable",
      color: "wet-waste",
      bgColor: "bg-green-100 border-green-300",
      emoji: "🌱"
    },
    {
      type: "dry",
      title: "Dry Waste",
      description: "Recyclable Materials",
      color: "dry-waste",
      bgColor: "bg-blue-100 border-blue-300",
      emoji: "♻️"
    },
    {
      type: "hazardous",
      title: "Hazardous Waste",
      description: "Dangerous Materials",
      color: "hazardous-waste",
      bgColor: "bg-red-100 border-red-300",
      emoji: "⚠️"
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            🎮 Waste Segregation Challenge
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Drag and drop waste items into the correct bins • Score: {score} points
          </p>
        </DialogHeader>

        <div className="p-4">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={wasteSegregationImage} 
                alt="Waste Segregation Guide" 
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">Items Remaining: {availableItems.length}</h3>
                <p className="text-sm text-muted-foreground">
                  {availableItems.length === 0 ? "🎉 Congratulations! You've sorted all items!" : "Drag items to the correct bins"}
                </p>
              </div>
            </div>
            <Button 
              onClick={resetGame} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Game
            </Button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="mb-6 p-4 bg-muted rounded-lg text-center font-medium">
              {feedback}
            </div>
          )}

          {/* Game Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Waste Items */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-4 text-center">Items to Sort</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto bg-muted/50 p-4 rounded-lg">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    className="bg-white p-3 rounded-lg shadow cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 flex items-center gap-3 border"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                ))}
                {availableItems.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    All items sorted! 🎉
                  </div>
                )}
              </div>
            </div>

            {/* Bins */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {bins.map((bin) => (
                <div
                  key={bin.type}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(bin.type);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('scale-105', 'shadow-lg');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('scale-105', 'shadow-lg');
                  }}
                  className={`${bin.bgColor} p-6 rounded-xl border-2 border-dashed text-center h-48 flex flex-col justify-center items-center transition-all duration-300 hover:scale-102 cursor-pointer`}
                >
                  <div className="text-4xl mb-3">{bin.emoji}</div>
                  <h4 className="text-xl font-bold mb-2">{bin.title}</h4>
                  <p className="text-sm text-muted-foreground">{bin.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Game Rules */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">How to Play:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Drag waste items from the left panel to the appropriate bins</li>
              <li>• <span className="text-green-600 font-medium">Wet Waste:</span> Organic materials like food scraps, peels</li>
              <li>• <span className="text-blue-600 font-medium">Dry Waste:</span> Recyclable materials like paper, plastic, metal</li>
              <li>• <span className="text-red-600 font-medium">Hazardous Waste:</span> Batteries, chemicals, electronic waste</li>
              <li>• Get 10 points for each correct placement!</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SegregationGame;
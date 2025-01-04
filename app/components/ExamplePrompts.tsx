import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const allPrompts = [
  {
    title: "Basic Math",
    prompt: "Calculate the sum and average of these five numbers: 2, 4, 6, 8, 10",
  },
  {
    title: "Text Analysis",
    prompt: "Count how many times each letter appears in the word 'hello'",
  },
  {
    title: "Simple Sequence",
    prompt: "Print the first 5 numbers in the Fibonacci sequence",
  },
  {
    title: "Random Numbers",
    prompt: "Generate 10 random numbers between 1 and 100 and sort them",
  },
  {
    title: "Word Play",
    prompt: "Check if these words are palindromes: 'mom', 'dad', 'hello'",
  },
  {
    title: "Number Fun",
    prompt: "List all even numbers between 1 and 20",
  },
  {
    title: "Simple Math",
    prompt: "Create a multiplication table for the number 5 (from 1 to 10)",
  },
  {
    title: "Coin Flip",
    prompt: "Simulate flipping a coin 20 times and count heads and tails",
  },
  {
    title: "Shape Math",
    prompt: "Calculate the area of a square with side length 4",
  },
  {
    title: "List Sorting",
    prompt: "Sort these numbers from smallest to largest: 7, 2, 9, 4, 1",
  },
  {
    title: "Secret Code",
    prompt: "Convert the word 'hello' to uppercase and reverse it",
  },
  {
    title: "Drawing",
    prompt: "Create a simple pattern using asterisks (*) in a 3x3 grid",
  },
  {
    title: "Grade Calculator",
    prompt: "Calculate the average grade for these scores: 85, 92, 78, 90",
  },
  {
    title: "Color Pattern",
    prompt: "Print a simple rainbow pattern using color names: red, orange, yellow",
  },
  {
    title: "Word Counter",
    prompt: "Count how many words are in this sentence: 'Python is fun and easy to learn'",
  },
  {
    title: "Temperature Convert",
    prompt: "Convert these Celsius temperatures to Fahrenheit: 0, 25, 100",
  },
  {
    title: "Name Game",
    prompt: "Take the name 'Alice' and print it in different styles: normal, UPPERCASE, reverse",
  },
  {
    title: "Shopping List",
    prompt: "Calculate the total cost: apple $1, banana $0.5, orange $0.75",
  },
  {
    title: "Number Guess",
    prompt: "Generate a random number between 1 and 10 and give hints if 5 is too high or too low",
  },
  {
    title: "Calendar Helper",
    prompt: "List all the days in a week and number them from 1 to 7",
  },
  {
    title: "Shape Drawing",
    prompt: "Draw a triangle using the # symbol, with 3 rows",
  },
  {
    title: "Word Mixer",
    prompt: "Create all possible two-letter combinations using the letters 'A' and 'B'",
  },
  {
    title: "Time Calculator",
    prompt: "How many minutes are in 2 hours? How many seconds in 3 minutes?",
  },
  {
    title: "Animal Sounds",
    prompt: "Create a list of animals and their sounds: dog-woof, cat-meow, duck-quack",
  },
  {
    title: "Number Pattern",
    prompt: "Print numbers in this pattern: 1, 11, 111, 1111, 11111",
  },
];

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export default function ExamplePrompts({ onPromptSelect }: ExamplePromptsProps) {
  // Get initial random prompts
  const getRandomPrompts = useCallback(() => {
    return [...allPrompts]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, []);

  // Store the selected prompts in state
  const [selectedPrompts, setSelectedPrompts] = useState(getRandomPrompts());

  // Handler for refreshing prompts
  const handleRefresh = () => {
    setSelectedPrompts(getRandomPrompts());
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Try These Examples</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Prompts
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedPrompts.map((prompt, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-2">{prompt.title}</h3>
              <p className="text-muted-foreground mb-4">{prompt.prompt}</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onPromptSelect(prompt.prompt)}
              >
                Try this example
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Qwen Code Interpreter?",
    answer: "Qwen Code Interpreter is an AI model that can understand and execute Python code directly in your browser. It combines natural language understanding with Python execution capabilities."
  },
  {
    question: "How does it work?",
    answer: "The model runs entirely in your browser using WebAssembly technology. When you ask a question, it generates Python code to solve your problem and executes it using Pyodide, a Python runtime for the web."
  },
  {
    question: "What kind of tasks can it perform?",
    answer: "It can handle various tasks including mathematical calculations, data analysis, text processing, and basic algorithmic problems. It can also explain its reasoning and show you the code it uses."
  },
  {
    question: "Is my data safe?",
    answer: "Yes! Since everything runs locally in your browser, no data is sent to external servers. Your queries and computations remain private on your device."
  }
];

export default function FAQ() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

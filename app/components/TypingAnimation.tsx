"use client";
import React, { useState, useEffect } from "react";

interface TypingAnimationProps {
  text: string;
  speed?: number;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 50,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const textLength = text.length;

    const typingInterval = setInterval(() => {
      if (currentIndex < textLength) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return (
    <span className="inline-flex items-center">
      {displayedText}
      {!isTypingComplete && (
        <span className="ml-0.5 h-5 w-0.5 bg-current animate-blink"></span>
      )}
    </span>
  );
};

export default TypingAnimation;

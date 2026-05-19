import React, { useState, useEffect, useRef } from "react";
import ImageSlider from "./ImageSlider.jsx";

import white1 from "./assets/white-shirt.png";
import white2 from "./assets/white-shirt2.png";
import white3 from "./assets/white-shirt3.png";
import white4 from "./assets/white-shirt4.png";

import blue1 from "./assets/blue-nike.png";
import blue2 from "./assets/blue-nike2.png";
import blue3 from "./assets/blue-nike3.png";
import blue4 from "./assets/blue-nike4.png";
import chatbotLogo from "./assets/bot-icon.svg";

const MESSAGE_TYPING_SPEED = 50;
const USER_START_DELAY = 180;
const BOT_START_DELAY = 1000;
const BOT_TEXT_START_DELAY = 220;
const AUTO_QUESTION_GAP = 300;
const AUTO_QUESTIONS = [
  "Is this available in my size?",
  "Is this product original?",
  "Is this a duplicate product?",
  "Do you offer cash on delivery?",
  "Do you have COD available?",
  "What payment options do you offer?",
  "My food arrived cold.",
  "Where is my order?",
  "ORD-20260421-7842",
  "Can I cancel my order?",
  "How can I track my order?",
  "How do I track my order?",
  "I have tanning issues.",
  "I have blackheads.",
  "What is the price of a facial?",
  "What is the price of Nike shoes?",
  "Show me white shirts.",
  "Show me blue Nike shoes.",
];

const getTypingDuration = (text, startDelay) =>
  startDelay + (text?.length || 0) * MESSAGE_TYPING_SPEED;

const getTimeLabel = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const TypewriterText = ({ text, speed = 50, startDelay = 220, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTextDone, setIsTextDone] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedText("");
    setIsTextDone(false);
    if (!text) {
      setIsTextDone(true);
      onCompleteRef.current?.();
      return undefined;
    }

    let index = 0;
    let typingTimer;
    const startTimer = setTimeout(() => {
      typingTimer = setInterval(() => {
        index += 1;
        setDisplayedText(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(typingTimer);
          setIsTextDone(true);
          onCompleteRef.current?.();
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      clearInterval(typingTimer);
    };
  }, [text, speed, startDelay]);

  return (
    <p
      className="whitespace-pre-line text-left"
      style={{ direction: "ltr", unicodeBidi: "plaintext" }}
    >
      {displayedText}
      {!isTextDone && <span className="typing-cursor">|</span>}
    </p>
  );
};

// ✅ Typing indicator with bouncing dots
const TypingIndicator = () => (
  <div className="flex gap-2 items-end animate-slide-in-left">
    <div
      className="w-6 font-sans h-6 rounded-full overflow-hidden flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, #6E1C1C, #8B2222)",
        boxShadow: "0 2px 6px rgba(92,26,26,0.35)",
      }}
    >
      <img src={chatbotLogo} alt="bot-logo" className="w-full h-full object-cover" />
    </div>
    <div
      className="px-3 font-sans py-2 flex gap-1 items-center"
      style={{
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "0.5px solid rgba(214,207,199,0.6)",
        borderRadius: "2px 12px 12px 12px",
      }}
    >
      {/* ✅ Dots use CSS classes from index.css */}
      <div className="w-1.5 h-1.5 bg-[#6E1C1C] rounded-full animate-dot-1" />
      <div className="w-1.5 h-1.5 bg-[#6E1C1C] rounded-full animate-dot-2" />
      <div className="w-1.5 h-1.5 bg-[#6E1C1C] rounded-full animate-dot-3" />
    </div>
  </div>
);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typedDoneMap, setTypedDoneMap] = useState({});
  const [detanBookingStep, setDetanBookingStep] = useState("idle");
  const chatRef = useRef(null);
  const hasAutoQuestionRunRef = useRef(false);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!chatRef.current) return undefined;

    const node = chatRef.current;
    const keepBottomInView = () => {
      node.scrollTop = node.scrollHeight;
    };

    const observer = new MutationObserver(() => {
      keepBottomInView();
    });

    observer.observe(node, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  const getBotResponse = (text) => {
    const msg = text.toLowerCase();
    let response = { sender: "bot", text: "Sorry, I didn't understand that." };

    if (detanBookingStep === "awaiting-confirmation") {
      if (
        msg.includes("yes") ||
        msg.includes("yeah") ||
        msg.includes("yep") ||
        msg.includes("book")
      ) {
        return {
          sender: "bot",
          text:
            "Here are our De-Tan options:\n1. Basic De-Tan Facial - ₹799\n2. De-Tan + Deep Cleansing Facial - ₹1,299\n3. Premium De-Tan Glow Facial - ₹1,899",
        };
      }

      if (msg.includes("no")) {
        return {
          sender: "bot",
          text: "No problem. Let me know if you'd like to explore other services.",
        };
      }
    }

    if (detanBookingStep === "awaiting-service-selection") {
      if (
        msg.includes("basic de-tan") ||
        msg.includes("de-tan + deep cleansing") ||
        msg.includes("premium de-tan glow")
      ) {
        return {
          sender: "bot",
          text: "Appointment booked.",
        };
      }
    }

    if (msg.includes("available in my size")) {
      response = {
        sender: "bot",
        text: "Yes, this product is available in multiple sizes, including 7, 8, and 9.",
      };
    }

    else if (
      msg.includes("available in my color") ||
      msg.includes("available in my colour")
    ) {
      response = {
        sender: "bot",
        text: "Yes, this product is available in multiple color options.",
      };
    }

    else if (msg.includes("original")) {
      response = {
        sender: "bot",
        text: "Yes, this product is 100% original.",
      };
    }

    else if (msg.includes("duplicate")) {
      response = {
        sender: "bot",
        text: "No, this is not a duplicate product; it is original.",
      };
    }

    else if (msg.includes("cash on delivery")) {
      response = {
        sender: "bot",
        text: "Yes, we offer Cash on Delivery (COD).",
      };
    }

    else if (msg.includes("cod")) {
      response = {
        sender: "bot",
        text: "Yes, COD is available for this order.",
      };
    }

    else if (msg.includes("payment")) {
      response = {
        sender: "bot",
        text: "We accept payments through Credit Cards, Debit Cards,UPI and Cash on Delivery.",
      };
    }

    else if (msg.includes("food arrived cold")) {
      response = {
        sender: "bot",
        text: "We sincerely apologize for the inconvenience. Please share your Order ID so we can arrange a replacement or a full refund.",
      };
    }

    else if (msg.includes("where is my order")) {
      response = {
        sender: "bot",
        text: "Please share your Order ID or registered mobile number/email, and I will check your order status right away.",
      };
    }

    else if (msg.includes("ord-20260421-7842")) {
      response = { sender: "bot", text: "Your order will be delivered today." };
    }

    else if (msg.includes("cancel my order")) {
      response = {
        sender: "bot",
        text: "Yes, you can cancel your order before it is shipped. After shipping, you can request a return once it is delivered.",
      };
    }

    else if (
      msg.includes("track my order") ||
      msg.includes("how do i track my order")
    ) {
      response = {
        sender: "bot",
        text: "You can track your order using the tracking link sent to your email or SMS after shipment.",
      };
    }

    else if (msg.includes("tan") || msg.includes("tanning")) {
      response = {
        sender: "bot",
        text: "For tanning concerns, we recommend a De-Tan + Deep Cleansing Facial. Would u like to book appointment?",
      };
    }

    else if (msg.includes("blackhead")) {
      response = {
        sender: "bot",
        text: "For blackheads, we recommend a De-Tan + Deep Cleansing Facial to cleanse and clear the skin.",
      };
    }

    else if (msg.includes("price") && msg.includes("facial")) {
      response = {
        sender: "bot",
        text: "Facial pricing typically ranges from under ₹500 to ₹3,000+, depending on the type of facial and service provider.",
      };
    }

    else if (
      msg.includes("price") &&
      (msg.includes("nike") || msg.includes("shoes"))
    ) {
      response = {
        sender: "bot",
        text: "Nike shoes usually range from ₹3,295 to ₹13,000, depending on the model.",
      };
    }

   else if (msg.includes("white shirt")) {
  response = {
    sender: "bot",
    text: "Here are white shirts for you.",
    images: [
      { src: white1, name: "Classic White Shirt" },
      { src: white2, name: "Formal White Shirt" },
      { src: white3, name: "Casual Cotton Shirt" },
      { src: white4, name: "Slim Fit White Shirt" },
    ],
    type: "shirt",
  };
}

   else if (msg.includes("blue nike shoes")) {
  response = {
    sender: "bot",
    text: "Here are blue Nike shoes for you.",
    images: [
      { src: blue1, name: "Nike Revolution 6" },
      { src: blue2, name: "Nike Quest 5" },
      { src: blue3, name: "Nike Pegasus 40" },
      { src: blue4, name: "Nike Pegasus 41" },
    ],
    type: "shoes",
  };
}

    return response;
  };

  const sendUserMessage = (userMessage) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage, time: getTimeLabel() },
    ]);
    const userTypingDuration = getTypingDuration(userMessage, USER_START_DELAY);
    setTimeout(() => {
      handleBotResponse(userMessage);
    }, userTypingDuration);

  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendUserMessage(input);
    setInput("");
  };

  const handleBotResponse = (text) => {
    const normalizedText = text.toLowerCase();
    if (normalizedText.includes("tan") || normalizedText.includes("tanning")) {
      setDetanBookingStep("awaiting-confirmation");
    } else if (
      detanBookingStep === "awaiting-confirmation" &&
      (normalizedText.includes("yes") ||
        normalizedText.includes("yeah") ||
        normalizedText.includes("yep") ||
        normalizedText.includes("book"))
    ) {
      setDetanBookingStep("awaiting-service-selection");
    } else if (
      detanBookingStep === "awaiting-confirmation" &&
      normalizedText.includes("no")
    ) {
      setDetanBookingStep("idle");
    } else if (
      detanBookingStep === "awaiting-service-selection" &&
      (normalizedText.includes("basic de-tan") ||
        normalizedText.includes("de-tan + deep cleansing") ||
        normalizedText.includes("premium de-tan glow"))
    ) {
      setDetanBookingStep("idle");
    }

    const response = getBotResponse(text);

    // ✅ Show typing first then message
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { ...response, time: getTimeLabel() }]);
    }, BOT_START_DELAY);
  };

  useEffect(() => {
    if (hasAutoQuestionRunRef.current) return undefined;
    hasAutoQuestionRunRef.current = true;

    let timeoutId;

    const askQuestionAtIndex = (index) => {
      if (index >= AUTO_QUESTIONS.length) return;

      const question = AUTO_QUESTIONS[index];
      const predictedResponse = getBotResponse(question);
      sendUserMessage(question);

      const userTypingDuration = getTypingDuration(question, USER_START_DELAY);
      const botTypingDuration = getTypingDuration(
        predictedResponse.text,
        BOT_TEXT_START_DELAY
      );
      const totalWait =
        userTypingDuration + BOT_START_DELAY + botTypingDuration + AUTO_QUESTION_GAP;

      timeoutId = setTimeout(() => {
        askQuestionAtIndex(index + 1);
      }, totalWait);
    };

    timeoutId = setTimeout(() => {
      askQuestionAtIndex(0);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className="h-screen font-sans w-full flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #e8e0d5 0%, #d4c9bc 50%, #c9bfb3 100%)",
      }}
    >
      {/* ✅ 3D lift wrapper */}
      <div
        className="transition-transform duration-300"
        style={{
          borderRadius: "16px",
          boxShadow: "0px 24px 36px rgba(92,26,26,0.22)",
        }}
      >
        <div
          className="w-[320px] h-[520px] bg-[#F5F0EA] flex flex-col overflow-hidden"
          style={{
            borderRadius: "16px",
            border: "1px solid rgba(214,207,199,0.8)",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div
            className="text-white font-sans px-3 py-2 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #6E1C1C 0%, #8B2222 100%)",
              boxShadow: "0 2px 8px rgba(92,26,26,0.4)",
            }}
          >
            <div className="w-6 h-6 bg-white/20 rounded-full overflow-hidden">
              <img src={chatbotLogo} alt="chatbot-logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-tight">Chatbot</h2>
              <p className="text-[9px] text-white/70 leading-tight">Online · Ready to help</p>
            </div>
            <div className="ml-auto">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Chat area */}
          <div
            ref={chatRef}
            className="flex-1 p-3 overflow-y-auto space-y-3"
            style={{
              background: "linear-gradient(180deg, #F5F0EA 0%, #F0EAE2 100%)",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end animate-slide-in-right"  // ✅ user slides from right
                    : "gap-2 animate-slide-in-left"         // ✅ bot slides from left
                }`}
              >
                {msg.sender === "bot" && (
                  <div
                    className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                    style={{
                      background: "linear-gradient(135deg, #6E1C1C, #8B2222)",
                      boxShadow: "0 2px 6px rgba(92,26,26,0.35)",
                    }}
                  >
                    <img src={chatbotLogo} alt="bot-logo" className="w-full h-full object-cover" />
                  </div>
                )}

                <div
                  className={`p-2 rounded-lg text-xs max-w-[85%] ${
                    msg.sender === "user" ? "text-white" : "text-gray-800"
                  }`}
                  style={
                    msg.sender === "user"
                      ? {
                          background: "linear-gradient(135deg, #6E1C1C, #8B2222)",
                          boxShadow: "0 4px 12px rgba(92,26,26,0.3), 0 1px 3px rgba(0,0,0,0.1)",
                          borderRadius: "12px 12px 2px 12px",
                        }
                      : {
                          background: "rgba(255,255,255,0.85)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          border: "0.5px solid rgba(214,207,199,0.6)",
                          borderRadius: "2px 12px 12px 12px",
                        }
                  }
                >
                  {msg.sender === "bot" ? (
                    <div className="animate-reveal-left-to-right">
                      <TypewriterText
                        text={msg.text}
                        speed={MESSAGE_TYPING_SPEED}
                        onComplete={() =>
                          setTypedDoneMap((prev) =>
                            prev[i] ? prev : { ...prev, [i]: true }
                          )
                        }
                      />
                    </div>
                  ) : (
                    <div className="animate-reveal-left-to-right">
                      <TypewriterText
                        text={msg.text}
                        speed={MESSAGE_TYPING_SPEED}
                        startDelay={USER_START_DELAY}
                        onComplete={() =>
                          setTypedDoneMap((prev) =>
                            prev[i] ? prev : { ...prev, [i]: true }
                          )
                        }
                      />
                    </div>
                  )}

                  {/* ✅ Images animate up when shown */}
                  {msg.images && msg.images.length > 0 && typedDoneMap[i] && (
                    <div className="mt-2 animate-fade-in-up">
                      <ImageSlider images={msg.images} type={msg.type} />
                    </div>
                  )}

                  <p
                    className={`mt-1 text-[9px] ${
                      msg.sender === "user" ? "text-white/70 text-right" : "text-gray-500"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* ✅ Typing indicator */}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Input */}
          <div
            className="p-2 flex gap-2"
            style={{
              background: "rgba(255,255,255,0.95)",
              borderTop: "1px solid rgba(214,207,199,0.8)",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
              placeholder="Type a message..."
              style={{
                border: "1px solid rgba(214,207,199,0.8)",
                background: "#FAF6F1",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6E1C1C")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(214,207,199,0.8)")}
            />
            <button
              onClick={handleSend}
              className="text-white px-3 text-xs rounded-lg"
              style={{
                background: "linear-gradient(135deg, #6E1C1C, #8B2222)",
                boxShadow: "0 2px 8px rgba(92,26,26,0.4)",
                transition: "transform 0.15s ease, opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

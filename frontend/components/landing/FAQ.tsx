"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the AI interview work?",
    answer: "Our AI interviewer asks you questions based on your selected role and difficulty level. You respond verbally or via text, and the AI evaluates your answer in real-time, asks follow-up questions, and provides detailed feedback at the end.",
  },
  {
    question: "What programming languages are supported for coding challenges?",
    answer: "We support JavaScript, TypeScript, Python, Java, C++, and PHP. More languages are being added regularly.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period, after which you'll be downgraded to the Free plan.",
  },
  {
    question: "How accurate is the AI evaluation?",
    answer: "Our AI evaluation system uses advanced GPT-4 and Gemini models to provide accurate, consistent, and fair assessments across multiple dimensions including technical accuracy, communication, problem-solving, and more.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
  },
  {
    question: "How is my data protected?",
    answer: "We use industry-standard encryption, secure JWT authentication, and follow best security practices. Your interview data and personal information are never shared with third parties.",
  },
  {
    question: "Can I practice system design interviews?",
    answer: "Yes, system design interviews are available on the Premium plan. You can practice designing scalable systems like URL shorteners, chat applications, and e-commerce platforms.",
  },
  {
    question: "Is there a mobile app available?",
    answer: "Currently, InterviewAI is a web application optimized for all devices. A mobile app is in development and will be released soon.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-secondary/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

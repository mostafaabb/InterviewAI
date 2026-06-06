"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content: "InterviewAI helped me prepare for my Google interviews. The AI feedback was incredibly accurate and helped me identify my weak areas before the real interview.",
    rating: 5,
  },
  {
    name: "James Rodriguez",
    role: "Full Stack Developer at Meta",
    content: "The system design interviews were exactly what I needed. The AI asked realistic questions and gave detailed feedback on my architecture decisions.",
    rating: 5,
  },
  {
    name: "Emily Thompson",
    role: "Frontend Engineer at Stripe",
    content: "I improved my coding skills significantly using the challenges. The AI evaluation helped me understand time complexity and best practices better.",
    rating: 5,
  },
  {
    name: "Michael Park",
    role: "Backend Developer at Amazon",
    content: "The behavioral interview practice was game-changing. The AI asked tough questions and coached me on using the STAR method effectively.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Engineers at Top Companies</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our users say about their interview preparation journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-border/50 bg-card"
            >
              <div className="flex mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">{testimonial.content}</p>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

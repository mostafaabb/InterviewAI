"use client";

import { motion } from "framer-motion";
import { Bot, Code, Brain, BarChart3, Target, FileText } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Mock Interviews",
    description: "Practice with an AI interviewer that adapts to your skill level and provides real-time feedback.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Code,
    title: "Coding Challenges",
    description: "Solve real-world coding problems with AI-powered evaluation and detailed feedback.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Brain,
    title: "Behavioral Practice",
    description: "Master behavioral questions with realistic AI recruiter simulations.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: FileText,
    title: "Detailed Feedback",
    description: "Get comprehensive reports on communication, technical accuracy, and problem-solving.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your improvement with detailed charts, streaks, and skill level assessments.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Target,
    title: "Interview Reports",
    description: "Receive actionable insights and personalized recommendations for improvement.",
    gradient: "from-rose-500 to-purple-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive interview preparation tools powered by advanced AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@interviewai.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@interviewai.com',
      password: adminPassword,
      role: 'ADMIN',
      plan: 'PREMIUM',
      emailVerified: true,
      subscription: {
        create: { plan: 'PREMIUM', status: 'ACTIVE' },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@interviewai.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@interviewai.com',
      password: userPassword,
      role: 'CANDIDATE',
      plan: 'FREE',
      emailVerified: true,
      subscription: {
        create: { plan: 'FREE', status: 'ACTIVE' },
      },
    },
  });

  const challenges = [
    {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
      category: 'Algorithms',
      difficulty: 'EASY',
      constraints: '2 <= nums.length <= 104\n-109 <= nums[i] <= 109\n-109 <= target <= 109',
      examples: JSON.stringify([{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }, { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }]),
    },
    {
      title: 'Valid Parentheses',
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      category: 'Algorithms',
      difficulty: 'EASY',
      constraints: '1 <= s.length <= 104\ns consists of parentheses only',
      examples: JSON.stringify([{ input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }]),
    },
    {
      title: 'Reverse Linked List',
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      category: 'Data Structures',
      difficulty: 'EASY',
      constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
      examples: JSON.stringify([{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }]),
    },
    {
      title: 'LRU Cache',
      description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
      category: 'Data Structures',
      difficulty: 'MEDIUM',
      constraints: '1 <= capacity <= 3000\n0 <= key <= 104\n0 <= value <= 105',
      examples: JSON.stringify([{ input: 'LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1);\nlRUCache.put(2, 2);\nlRUCache.get(1);', output: '1' }]),
    },
    {
      title: 'Build a React Counter',
      description: 'Create a React counter component with increment, decrement, and reset functionality.',
      category: 'React',
      difficulty: 'EASY',
      examples: JSON.stringify([{ input: 'Click increment', output: 'Count increases by 1' }]),
    },
    {
      title: 'Build a REST API with Express',
      description: 'Create a RESTful API for a todo application with CRUD operations.',
      category: 'Node.js',
      difficulty: 'MEDIUM',
      examples: JSON.stringify([{ input: 'GET /todos', output: 'Returns list of todos' }]),
    },
    {
      title: 'SQL Query: Employee Salaries',
      description: 'Write a SQL query to find employees who earn more than their managers.',
      category: 'SQL',
      difficulty: 'MEDIUM',
      constraints: 'Table: Employee (id, name, salary, managerId)',
      examples: JSON.stringify([{ input: 'Write SQL query', output: 'Returns employees with salary > manager salary' }]),
    },
    {
      title: 'Design a URL Shortener',
      description: 'Design a URL shortening service like TinyURL.',
      category: 'System Design',
      difficulty: 'HARD',
      constraints: 'Handle millions of URLs\nGenerate short unique keys',
      examples: JSON.stringify([{ input: 'Original: https://example.com/very/long/url', output: 'Short: https://short.url/abc123' }]),
    },
  ];

  await prisma.codingChallenge.deleteMany();
  for (const challenge of challenges) {
    await prisma.codingChallenge.create({ data: challenge });
  }

  const achievements = [
    { name: 'First Interview', description: 'Complete your first mock interview', icon: '🎯' },
    { name: '7 Day Streak', description: 'Practice for 7 days in a row', icon: '🔥' },
    { name: '50 Challenges Solved', description: 'Solve 50 coding challenges', icon: '💻' },
    { name: 'Top Performer', description: 'Score 90+ on an interview', icon: '⭐' },
    { name: 'Perfect Score', description: 'Get 100% on a coding challenge', icon: '🏆' },
    { name: 'Quick Learner', description: 'Complete 3 interviews in a day', icon: '📚' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

  console.log('Seed data created successfully');
  console.log('Admin: admin@interviewai.com / admin123');
  console.log('User: user@interviewai.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

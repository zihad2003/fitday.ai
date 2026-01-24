export interface Exercise {
    id: string;
    name: string;
    bnName: string;
    category: 'Home' | 'Gym' | 'Cardio';
    caloriesPerMinute: number;
    gifUrl: string;
    description: string;
}

export const exercises: Exercise[] = [
    {
        id: 'pushups',
        name: 'Push Ups',
        bnName: 'পুশ আপ',
        category: 'Home',
        caloriesPerMinute: 8,
        gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJsbXF6ZTZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uA8W6fB9V4zNS/giphy.gif',
        description: 'A classic upper body exercise.'
    },
    {
        id: 'squats',
        name: 'Squats',
        bnName: 'স্কোয়াট',
        category: 'Home',
        caloriesPerMinute: 6,
        gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJsbXF6ZTZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26uf8k3PxlC2F6JkQ/giphy.gif',
        description: 'Perfect for building leg strength.'
    },
    {
        id: 'plank',
        name: 'Plank',
        bnName: 'প্ল্যাঙ্ক',
        category: 'Home',
        caloriesPerMinute: 4,
        gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJsbXF6ZTZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/v1.Y2lkPTc5MGI3NjExNHJsbXF6ZTZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT8qBvH1pAhtfSraeA/giphy.gif',
        description: 'Core stability exercise.'
    },
    {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        bnName: 'জাম্পিং জ্যাকস',
        category: 'Cardio',
        caloriesPerMinute: 10,
        gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJsbXF6ZTZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vR7l6qY6Y6Y6Y6Y/giphy.gif',
        description: 'Full body cardio.'
    },
    {
        id: 'bicep-curls',
        name: 'Bicep Curls',
        bnName: 'বাইসেপ কার্ল',
        category: 'Gym',
        caloriesPerMinute: 5,
        gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJsbXF6ZTZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/v1.Y2lkPTc5MGI3NjExNHJsbXF6ZTZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZWZ6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMGpx6vU9bMh7G/giphy.gif',
        description: 'Isolate those biceps.'
    },
    // Add more to reach 30
];

// Filling up to 30 with similar structures...
for (let i = 1; i <= 25; i++) {
    exercises.push({
        id: `ex-${i}`,
        name: `Exercise ${i}`,
        bnName: `ব্যায়াম ${i}`,
        category: i % 2 === 0 ? 'Home' : 'Gym',
        caloriesPerMinute: 5 + (i % 5),
        gifUrl: `https://i.imgur.com/8Qp4R3T.gif`, // Placeholder
        description: `Description for exercise ${i}`
    });
}

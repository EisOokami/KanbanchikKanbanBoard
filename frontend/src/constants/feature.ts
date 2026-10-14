export const columns = [
    { title: "Todo", cards: 3 },
    { title: "In progress", cards: 2, accent: true },
    { title: "Done", cards: 2 },
];

export const items = [
    { label: "Draft API schema", done: true },
    { label: "Build auth endpoints", done: true },
    { label: "Write integration tests", done: false },
];

export const deadlines = [
    {
        month: "Sep",
        day: "23",
        title: "Fix responsive layout",
        meta: "Frontend",
    },
    {
        month: "Sep",
        day: "24",
        title: "Implement authentication",
        meta: "Backend",
    },
    { month: "Sep", day: "25", title: "Design dashboard", meta: "Design" },
];

export const workload = [
    { name: "Maya", barClass: 80 },
    { name: "Diego", barClass: 60 },
    { name: "Sam", barClass: 40 },
];

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/shadcn/accordion";
import { SectionHeading } from "../sectionHeading/SectionHeading";

const faqItems = [
    {
        question: "Can I use it for personal projects?",
        answer: "Yes. The project is open source and can be used for side projects, coursework, personal workflows or simply to experiment with Kanban.",
    },
    {
        question: "Can I invite my team?",
        answer: "Yes. You can invite other users to your projects and collaborate with them on boards, tasks and workflows.",
    },
    {
        question: "Can I customize project workflows?",
        answer: "Yes. Each board has customizable columns, allowing you to create a workflow that fits the way you and your team work.",
    },
    {
        question: "Can I set deadlines for tasks?",
        answer: "Yes. You can set start and due dates for tasks to keep track of deadlines and organize your work more effectively.",
    },
    {
        question: "Can I export project data?",
        answer: "Yes. Project data can be exported as JSON, making it easy to keep a backup or use your data elsewhere.",
    },
    {
        question: "Can I run the project myself?",
        answer: "Yes. Since the project is open source, you can run it locally or deploy your own instance on a server.",
    },
];

export function Faq() {
    return (
        <section id="faq" className="border-t py-16 md:py-24 lg:py-32">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-28">
                        <SectionHeading
                            id="faq-heading"
                            title="Questions, answered."
                        />
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            Something else on your mind?{" "}
                            <a
                                href="mailto:help.prydni@gmail.com"
                                className="hover:text-bright-blue-ink font-medium text-foreground underline underline-offset-4 transition-colors duration-200"
                            >
                                Get in touch
                            </a>
                            .
                        </p>
                    </div>
                </div>
                <Accordion
                    type="single"
                    collapsible
                    className="border-t lg:col-span-8"
                >
                    {faqItems.map((item) => (
                        <AccordionItem
                            key={item.question}
                            value={item.question}
                        >
                            <AccordionTrigger>{item.question}</AccordionTrigger>
                            <AccordionContent>{item.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { SectionHeading } from "../sectionHeading/SectionHeading";
import StoryList from "../storyList/StoryList";

export default function FounderStory() {
    return (
        <section
            id="founder-story"
            className="border-t py-16 md:py-24 lg:py-32"
        >
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-28">
                        <SectionHeading
                            id="story-heading"
                            title="Why I built Kanbanchik."
                        />
                        <div className="mt-8 flex items-center gap-3">
                            <Avatar className="size-8">
                                <AvatarImage src="https://github.com/EisOokami.png" />
                                <AvatarFallback className="text-xs font-semibold dark:text-foreground">
                                    EO
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">EisOokami</p>
                                <p className="text-xs text-muted-foreground">
                                    Founder of Kanbanchik
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-8">
                    <p className="text-pretty text-lg font-medium leading-snug sm:text-xl">
                        I built Kanbanchik because my own projects kept falling
                        apart in the gaps between tools. Tasks lived in a
                        spreadsheet, decisions in chat threads and deadlines in
                        my head.
                    </p>
                    <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
                        {[
                            "Most project tools I tried were made for large organizations. I spent more time configuring them than using them, and the board that was meant to save time became one more thing to maintain.",
                            "So I built the smaller version I wanted: a Kanban board that is quick to set up, honest about what is due, and quiet the rest of the time. I'm still shaping it with the people who use it.",
                        ].map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                    <div className="mt-10 grid gap-4 md:grid-cols-2">
                        <StoryList
                            title="The problem"
                            items={[
                                "Tasks split across spreadsheets, chat and notes",
                                "Tools that take longer to configure than to use",
                                "No clear view of what is due this week",
                            ]}
                            variant="problem"
                        />
                        <StoryList
                            title="What Kanbanchik does about it"
                            items={[
                                "One board where every task, owner and deadline lives",
                                "Editable columns and a setup that takes minutes",
                                "Deadlines and progress visible without a status meeting",
                            ]}
                            variant="solution"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface ICard {
    id: string;
    title: string;
    date: string;
    priority: "low" | "medium" | "high";
    tag:
        | "Research"
        | "Backend"
        | "UX"
        | "Design"
        | "QA"
        | "Marketing"
        | "DevOps"
        | "Frontend";
}

export interface IColumn {
    id: string;
    title: string;
    color: string;
    icon: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    cards: ICard[];
}

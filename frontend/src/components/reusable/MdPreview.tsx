import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
    className?: string;
    content?: string;
}

const MdPreview: FC<Props> = ({ className, content }) => {
    return (
        <div className={cn("custom-md", className)}>
            <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
    );
};

export default MdPreview;

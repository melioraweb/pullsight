import { Bitbucket, Github } from "@/components/reusable/icons";
import { Button } from "@/components/ui/button";
import { getAuthUrl } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";

const OauthButtons: FC = () => {
    return (
        <div className="flex flex-col md:flex-row gap-4 w-full">
            <Button
                asChild
                className="flex-grow-1 !bg-white !text-black hover:!bg-gray-200 text-base"
                size={"xl"}
            >
                <Link
                    href={getAuthUrl("github")}
                    className="flex items-center gap-2"
                >
                    <Github /> GitHub
                </Link>
            </Button>
            <Button
                asChild
                className="flex-grow-1 !bg-white !text-black hover:!bg-gray-200 text-base"
                size={"xl"}
            >
                <a
                    href={getAuthUrl("bitbucket")}
                    className="flex items-center gap-2"
                >
                    <Bitbucket /> BitBucket
                </a>
            </Button>
        </div>
    );
};

export default OauthButtons;

import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { ReactNode } from "react";
import ProgressSteps from "./ProgressSteps";
import Image from "next/image";
import AuthGuardClient from "@/components/auth/AuthGuardClient";
import { AuthGuardServer } from "@/components/auth/AuthGuardServer";
import LogoutHandler from "@/components/auth/LogoutHandler";

const OnboardingLayout = ({ children }: { children: ReactNode }) => {
    return (
        <AuthGuardServer>
            <AuthGuardClient>
                <div
                    className="pt-8 md:pt-14 pb-30 min-h-screen bg-no-repeat bg-cover bg-center max-w-screen overflow-hidden"
                    style={{
                        backgroundImage: "url('/images/gradient-bg.svg')",
                    }}
                >
                    <div className="container">
                        <div className="mb-12">
                            <div className="flex justify-between">
                                <Image
                                    src="/images/logo.svg"
                                    alt="pullsight logo"
                                    width={112}
                                    height={40}
                                    className=""
                                />
                                <LogoutHandler asChild>
                                    <Button
                                        variant="outline"
                                        className="text-white text-sm border-0 cursor-pointer hover:underline underline-offset-4"
                                    >
                                        <LogOutIcon />
                                        Logout
                                    </Button>
                                </LogoutHandler>
                            </div>

                            {!false && <ProgressSteps />}
                        </div>
                        <div className="flex flex-col gap-5 mx-auto justify-between mt-[64px]">
                            {children}
                        </div>
                    </div>
                </div>
            </AuthGuardClient>
        </AuthGuardServer>
    );
};

export default OnboardingLayout;

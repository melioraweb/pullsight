import { StarBullet } from "@/components/reusable/icons";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import OauthButtons from "../OauthButtons";

const RegisterPage = () => {
    return (
        <div className="min-h-screen py-5 md:py-12 flex flex-col">
            <div className="grid grid-cols-12 gap-4 lg:gap-8 flex-grow">
                <div className="col-span-12 lg:col-span-6 hidden lg:block">
                    <div
                        className="max-w-[772px] h-full py-[80px] px-[96px] bg-[var(--box-800)] rounded-[24px] flex flex-col gap-[100px] relative overflow-hidden"
                        style={{
                            backgroundImage: "url(/images/dot-pattern.svg)",
                        }}
                    >
                        <Image
                            src="/images/logo.svg"
                            alt="pullsight logo"
                            width={198}
                            height={71}
                            className=""
                        />
                        <div className="flex flex-col gap-[32px]">
                            <h1 className="lg:text-[30px] xl:text-[36px] font-bold">
                                Transform Your Code Reviews. Ship Better
                                Software, Faster.
                            </h1>
                            <p className="text-gray-300 max-w-[554px]">
                                AI-powered code insights for your pull requests.
                                Catch bugs, improve quality, and accelerate
                                development cycles before senior eyes even touch
                                the code.
                            </p>
                        </div>

                        <Image
                            src="/images/star-left.svg"
                            alt=""
                            width={600}
                            height={735}
                            className="absolute left-0 bottom-0 w-1/2"
                        />
                        <Image
                            src="/images/star-right.svg"
                            alt=""
                            width={219}
                            height={335}
                            className="absolute right-0 top-0 w-[250px]"
                        />
                    </div>
                </div>

                <div className="col-span-12 xl:col-span-4 xl:col-start-9 md:col-span-6">
                    <div className="flex flex-col gap-[40px] py-14">
                        <div className="flex flex-col gap-3">
                            <Image
                                src="/images/logo.svg"
                                alt="pullsight logo"
                                width={198}
                                height={71}
                                className="lg:hidden shrink-0 relative left-[-10px]"
                            />

                            <h2 className="text-[30px] sm:text-[36px] font-medium">
                                Create an Account
                            </h2>

                            <p className="text-[var(--subtitle-500)] text-sm">
                                <span>Already have an account?</span>
                                <span> </span>
                                <Link href="/auth/login" className="underline">
                                    Log in
                                </Link>
                            </p>
                        </div>

                        <div className="flex flex-col gap-[32px] mt-5 md:mt-10">
                            <OauthButtons />

                            <Separator />

                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        Join 100+ happy engineering teams.
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        Be part of a community you can develop
                                        yourself.
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        Seamlessly integrates with your existing
                                        workflow.
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        We don&apos;t store any part of your
                                        code.
                                    </span>
                                </li>
                            </ul>

                            <Separator />

                            <div className="flex  flex-col md:flex-row md:items-center gap-y-5 gap-x-12">
                                <div className="flex items-center gap-2 text-xs text-[var(--title-50)]">
                                    <Image
                                        src="/images/soc.svg"
                                        alt=""
                                        height={32}
                                        width={32}
                                    />
                                    <span className="">
                                        SOC2 <br /> Compliant
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--title-50)]">
                                    <Image
                                        src="/images/open-source.svg"
                                        alt=""
                                        height={32}
                                        width={32}
                                    />
                                    <span>
                                        Open <br /> Source
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--title-50)]">
                                    <Image
                                        src="/images/ssl.svg"
                                        alt=""
                                        height={32}
                                        width={25}
                                        className="mr-2 md:mr-0"
                                    />
                                    <span>
                                        SSL <br /> Encryption
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

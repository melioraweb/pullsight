"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, Sparkles } from "lucide-react";
import Dialog from "@/components/reusable/Dialog";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { ROUTE_CONSTANTS } from "@/lib/constants";

interface OnboardingCongratsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const OnboardingCongratsModal = ({
    open,
    onOpenChange,
}: OnboardingCongratsModalProps) => {
    const [copied, setCopied] = useState(false);

    // Generate the invite link
    const inviteLink = `${window.location.origin}${ROUTE_CONSTANTS.REGISTER}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            showToast.success("Invite link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy link:", error);
            showToast.error("Failed to copy link");
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
            title="🎉 Congratulations!"
            description="You've successfully completed the workspace setup"
            size="md"
            actions={[
                {
                    label: "Get Started",
                    onClick: handleClose,
                    variant: "default",
                },
            ]}
        >
            <div className="space-y-6">
                {/* Success Message */}
                <div className="text-center py-4">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        Your workspace is ready!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You can now start analyzing pull requests and managing
                        your team&apos;s code quality.
                    </p>
                </div>

                {/* Invite Team Members Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                            Invite Your Team
                        </h4>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                        Share this link with your team members to join your
                        workspace:
                    </p>

                    {/* Invite Link */}
                    <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-md border min-w-0">
                        <code className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                            {inviteLink}
                        </code>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyLink}
                            className="shrink-0 ml-auto"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>

                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                        Team members will be able to join your workspace and
                        start collaborating on code reviews.
                    </p>
                </div>

                {/* Quick Tips */}
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">What&apos;s next?</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>
                            • Review your dashboard for insights and analytics
                        </li>
                        <li>• Invite team members using the link above</li>
                        <li>• Configure repository settings as needed</li>
                        <li>• Start analyzing your pull requests</li>
                    </ul>
                </div>
            </div>
        </Dialog>
    );
};

export default OnboardingCongratsModal;

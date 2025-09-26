"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, Sparkles } from "lucide-react";
import Dialog from "@/components/reusable/Dialog";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { ROUTE_CONSTANTS } from "@/lib/constants";

interface InviteMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const InviteMemberModal = ({ open, onOpenChange }: InviteMemberModalProps) => {
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
            title="Invite Team Members"
            description="Share this link with your team members to join your workspace"
            size="md"
        >
            <div className="space-y-6">
                {/* Invite Team Members Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
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
            </div>
        </Dialog>
    );
};

export default InviteMemberModal;

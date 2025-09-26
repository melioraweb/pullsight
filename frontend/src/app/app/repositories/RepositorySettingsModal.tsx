"use client";

import { useUpdateRepositoryMutation } from "@/api/queries/workspace";
import Dialog from "@/components/reusable/Dialog";
import Select from "@/components/reusable/Select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/toast";
import { Repository } from "@/types/repository";
import { useEffect, useState } from "react";

interface RepositorySettingsModalProps {
    repository: Repository;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface RepositorySettings {
    minSeverity: "Info" | "Minor" | "Major" | "Critical" | "Blocker";
    ignore: string;
}

const severityOptions = [
    { value: "Info", label: "Info" },
    { value: "Minor", label: "Minor" },
    { value: "Major", label: "Major" },
    { value: "Critical", label: "Critical" },
    { value: "Blocker", label: "Blocker" },
];

const RepositorySettingsModal = ({
    repository,
    open,
    onOpenChange,
}: RepositorySettingsModalProps) => {
    const [settings, setSettings] = useState<RepositorySettings>({
        minSeverity: "Major",
        ignore: "",
    });

    const { mutateAsync, isPending } = useUpdateRepositoryMutation();

    const handleSave = async () => {
        // ignore will be array of strings
        await mutateAsync({
            id: repository._id,
            data: {
                ...settings,
                ignore: settings?.ignore
                    ?.split("\n")
                    ?.map((line) => line.trim())
                    ?.filter(Boolean),
            },
        })
            .then(() => {
                showToast.success("Repository settings updated successfully");
                onOpenChange(false);
            })
            .catch((error) => {
                showToast.error("Failed to update repository settings");
            });
    };

    const handleClose = () => {
        if (!isPending) {
            onOpenChange(false);
            // Reset settings to original values
            setSettings({
                minSeverity: "Info",
                ignore: "",
            });
        }
    };

    useEffect(() => {
        setSettings({
            minSeverity: repository.minSeverity,
            ignore: repository.ignore?.join("\n"),
        });
    }, [repository, open]);

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
            title={`Repository Settings - ${repository.name}`}
            description="Configure analysis settings for this repository"
            size="md"
            actions={[
                {
                    label: "Cancel",
                    onClick: handleClose,
                    variant: "outline",
                    disabled: isPending,
                },
                {
                    label: "Save Settings",
                    onClick: handleSave,
                    variant: "default",
                    loading: isPending,
                },
            ]}
            closeOnOverlayClick={!isPending}
        >
            <div className="space-y-6">
                {/* Minimum Severity Level */}
                <div className="space-y-2">
                    <Label
                        htmlFor="severity-select"
                        className="text-base font-medium"
                    >
                        Minimum Severity Level
                    </Label>
                    <p className="text-sm text-gray-500">
                        Only report issues at this severity level or higher
                    </p>
                    <Select
                        value={settings.minSeverity}
                        onChange={(value) =>
                            setSettings((prev) => ({
                                ...prev,
                                minSeverity:
                                    value as RepositorySettings["minSeverity"],
                            }))
                        }
                        options={severityOptions}
                        disabled={isPending}
                        className="w-full"
                    />
                </div>

                {/* Ignored Files */}
                <div className="space-y-2">
                    <Label
                        htmlFor="ignored-files"
                        className="text-base font-medium"
                    >
                        Ignored Files & Folders
                    </Label>
                    <p className="text-sm text-gray-500">
                        Specify files and folders to exclude from analysis (one
                        per line)
                    </p>
                    <Textarea
                        id="ignored-files"
                        placeholder={``}
                        value={settings.ignore}
                        onChange={(e) =>
                            setSettings((prev) => ({
                                ...prev,
                                ignore: e.target.value,
                            }))
                        }
                        disabled={isPending}
                        rows={6}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400">
                        For directories, use a trailing slash (e.g. `dist/`){" "}
                        <br />
                        For files, use gitignore-style patterns (e.g.
                        `*.min.js`)
                    </p>
                </div>
            </div>
        </Dialog>
    );
};

export default RepositorySettingsModal;

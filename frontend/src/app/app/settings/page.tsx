"use client";

import ContentCard from "@/components/reusable/ContentCard";
import Switch from "@/components/reusable/Switch";
import Input from "@/components/reusable/Input";
import Select from "@/components/reusable/Select";
import { useEffect, useState } from "react";
import { useUpdateWorkspaceSettingsMutation } from "@/api/queries/workspace";
import Alert from "@/components/reusable/Alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import showToast from "@/lib/toast";
import AdminGuard from "@/components/auth/AdminGuard";

const claudeModels = [
    { value: "claude-opus-4-1-20250805", label: "Claude 4.1 Opus - 20250805" },
    { value: "claude-opus-4-20250514", label: "Claude 4 Opus - 20250514" },
    { value: "claude-sonnet-4-20250514", label: "Claude 4 Sonnet - 20250514" },
    {
        value: "claude-3-7-sonnet-20250219",
        label: "Claude 3.7 Sonnet - 20250219",
    },
    {
        value: "claude-3-5-haiku-20241022",
        label: "Claude 3.5 Haiku - 20241022",
    },
];

const SettingsPage = () => {
    const { selectedWorkspace } = useAuthStore((s) => s);

    const [useOwnApiKey, setUseOwnApiKey] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [selectedModel, setSelectedModel] = useState(
        "claude-4-1-opus-20241022"
    );
    const [hourlyRate, setHourlyRate] = useState("50");

    const {
        mutateAsync: updateWorkspaceSettings,
        error,
        isPending,
    } = useUpdateWorkspaceSettingsMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: {
            apiKey?: string;
            model?: string;
            hourlyRate?: string;
        } = {};
        if (useOwnApiKey && !apiKey.trim()) {
            newErrors.apiKey = "API Key is required when using own API key";
        }
        if (useOwnApiKey && !selectedModel) {
            newErrors.model = "Please select a model";
        }

        const numericHourlyRate = parseFloat(hourlyRate);
        if (isNaN(numericHourlyRate) || numericHourlyRate <= 0) {
            newErrors.hourlyRate = "Please enter a valid hourly rate";
        }

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // Prepare payload
        const payload = {
            useOwnApiKey,
            apiKey: useOwnApiKey ? apiKey : null,
            model: useOwnApiKey ? selectedModel : null,
            hourlyRate: numericHourlyRate,
        };

        await updateWorkspaceSettings(payload)
            .then(() => {
                showToast.success("Settings updated successfully");
            })
            .catch((error) => {
                showToast.error("Failed to update settings");
            });
    };

    const handleSwitchChange = (checked: boolean) => {
        setUseOwnApiKey(checked);
        // Clear form when disabling
        if (!checked) {
            setApiKey("");
            setSelectedModel("claude-3-5-sonnet-20241022");
        }
    };

    useEffect(() => {
        if (selectedWorkspace?.workspaceSetting) {
            const setting: any = selectedWorkspace.workspaceSetting;
            setUseOwnApiKey(!!setting?.apiKey);
            setApiKey(setting?.apiKey || "");
            setSelectedModel(setting?.model || "claude-4-1-opus-20241022");
            setHourlyRate(setting?.hourlyRate?.toString() || "50");
        }
    }, [selectedWorkspace]);

    return (
        <AdminGuard shouldRedirectTo403>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        Settings
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Manage your account settings and API configuration.
                    </p>
                </div>

                {/* Settings Card */}
                <ContentCard className="">
                    {/* Section Header */}
                    <ContentCard.Header className="px-6 py-6 flex-col items-start border-b">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Workspace Configuration
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                            Configure your Claude API settings and hourly rate
                            for personalized usage.
                        </p>
                    </ContentCard.Header>

                    {/* Form Content */}
                    <ContentCard.Body className="px-6 py-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* API Key Toggle Section */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1 mr-8">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        Use your own API key
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                                        Enable this to use your own Claude API
                                        key. This gives you more control and
                                        higher rate limits.
                                    </p>
                                </div>
                                <Switch
                                    checked={useOwnApiKey}
                                    onCheckedChange={handleSwitchChange}
                                />
                            </div>

                            {/* Conditional API Configuration */}
                            {useOwnApiKey && (
                                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                    <Input
                                        label="API Key"
                                        type="password"
                                        value={apiKey}
                                        onValueChange={setApiKey}
                                        placeholder="sk-ant-api03-..."
                                        description="Your Claude API key from Anthropic Console"
                                        // error={errors.apiKey}
                                        required
                                        className=""
                                    />
                                    <Select
                                        label="Claude Model"
                                        options={claudeModels}
                                        value={selectedModel}
                                        onChange={setSelectedModel}
                                        // error={errors.model}
                                        required
                                    />
                                </div>
                            )}

                            {/* Hourly Rate Configuration */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                                <Input
                                    label="Hourly Rate"
                                    type="number"
                                    value={hourlyRate}
                                    onValueChange={setHourlyRate}
                                    placeholder="50"
                                    description="Your hourly rate used to calculate money saved from automated PR reviews"
                                    // error={errors.hourlyRate}
                                    required
                                    min="0"
                                    step="0.01"
                                    className=""
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end pt-6 border-t gap-x-3 border-gray-200 dark:border-gray-800">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="min-w-[120px]"
                                    size={"lg"}
                                >
                                    {isPending ? "Saving..." : "Save changes"}
                                </Button>
                            </div>
                        </form>
                    </ContentCard.Body>
                </ContentCard>
            </div>
        </AdminGuard>
    );
};

export default SettingsPage;

import { FC } from "react";

interface CircularProgressProps {
    value: number; // Progress value (0-100)
    size?: number; // Size of the circle
    strokeWidth?: number; // Width of the progress stroke
    className?: string;
}

const CircularProgress: FC<CircularProgressProps> = ({
    value,
    size = 48,
    strokeWidth = 6,
    className = "",
}) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    // Calculate circle properties
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset =
        circumference - (clampedValue / 100) * circumference;

    // Center point
    const center = size / 2;

    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                className="transform -rotate-90" // Start from top
            >
                {/* <defs>
                    <linearGradient
                        id="progressGradient"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor="rgb(251 191 36 / 0)" />
                        <stop offset="30%" stopColor="rgb(251 191 36 / 0.4)" />
                        <stop offset="70%" stopColor="rgb(251 191 36 / 0.8)" />
                        <stop offset="100%" stopColor="rgb(251 191 36)" />
                    </linearGradient>
                </defs> */}
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-yellow-400/10"
                />

                {/* Progress circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-yellow-400 transition-all duration-300 ease-in-out"
                />
            </svg>
        </div>
    );
};

export default CircularProgress;

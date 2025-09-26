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
    const center = size / 2;

    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            {/* CSS-based conic gradient background */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `conic-gradient(from 0deg, 
                        rgba(251, 191, 36, 0) 0deg,
                        rgba(251, 191, 36, 0.4) ${clampedValue * 1.8}deg,
                        rgba(251, 191, 36, 0.8) ${clampedValue * 2.7}deg,
                        rgba(251, 191, 36, 1) ${clampedValue * 3.6}deg,
                        transparent ${clampedValue * 3.6}deg
                    )`,
                    mask: `radial-gradient(circle, transparent ${
                        radius - strokeWidth / 2
                    }px, black ${radius - strokeWidth / 2}px, black ${
                        radius + strokeWidth / 2
                    }px, transparent ${radius + strokeWidth / 2}px)`,
                    WebkitMask: `radial-gradient(circle, transparent ${
                        radius - strokeWidth / 2
                    }px, black ${radius - strokeWidth / 2}px, black ${
                        radius + strokeWidth / 2
                    }px, transparent ${radius + strokeWidth / 2}px)`,
                }}
            />

            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgb(251 191 36 / 0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
            </svg>
        </div>
    );
};

export default CircularProgress;

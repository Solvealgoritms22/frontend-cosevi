"use client";

import React, { useState, useEffect } from "react";
import { User, Shield } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string | null;
    name?: string;
    role?: string;
    className?: string;
    iconSize?: number;
    showInitials?: boolean;
}

export function UserAvatar({
    src,
    name,
    role,
    className,
    iconSize = 24,
    showInitials = false,
}: UserAvatarProps) {
    const [error, setError] = useState(false);

    // Reset error state if src changes
    useEffect(() => {
        setError(false);
    }, [src]);

    const initials = name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const getImageUrl = (url: string) => {
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (src && !error) {
        return (
            <img
                src={getImageUrl(src)}
                alt={name || "User avatar"}
                className={cn("w-full h-full object-cover", className)}
                onError={() => setError(true)}
            />
        );
    }

    // Fallback logic
    return (
        <div
            className={cn(
                "w-full h-full flex items-center justify-center bg-slate-100 text-slate-400",
                className
            )}
        >
            {showInitials ? (
                <span className="font-bold text-sm">{initials}</span>
            ) : role === "ADMIN" ? (
                <Shield size={iconSize} strokeWidth={1.5} />
            ) : (
                <User size={iconSize} strokeWidth={1.5} />
            )}
        </div>
    );
}

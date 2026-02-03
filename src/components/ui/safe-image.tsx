"use client";

import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

import Image from "next/image";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
    src: string | null | undefined;
    alt: string;
    width?: number;
    height?: number;
    fallback?: React.ReactNode;
}

export function SafeImage({ src, alt, className, fallback, width, height, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [src]);

    if (!src || error) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center bg-slate-50 text-slate-300", className)}>
                {fallback || <ImageOff size={24} strokeWidth={1.5} />}
            </div>
        );
    }

    const isFills = !width && !height;

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                fill={isFills}
                className={cn("object-cover", className)}
                onError={() => setError(true)}
                {...(props as any)}
            />
        </div>
    );
}

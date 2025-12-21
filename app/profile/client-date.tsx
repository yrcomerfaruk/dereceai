'use client';

import { useState, useEffect } from 'react';

export default function ClientOnlyDate({ targetDate }: { targetDate: string }) {
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        const days = Math.ceil(
            (new Date(targetDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        setDaysLeft(days);
    }, [targetDate]);

    if (daysLeft === null) return <span>...</span>;

    return <span>{daysLeft}</span>;
}

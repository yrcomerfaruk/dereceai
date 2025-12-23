import { useEffect } from 'react';

interface NetInputProps {
    groups: { id: string; name: string; max: number }[];
    currentNets: Record<string, number>;
    targetNets: Record<string, number>;
    onCurrentChange: (id: string, value: number) => void;
    onTargetChange: (id: string, value: number) => void;
}

export function NetInput({ groups, currentNets, targetNets, onCurrentChange, onTargetChange }: NetInputProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-[1fr_84px_84px] gap-4 px-2 mb-2">
                <span className="invisible text-xs font-bold uppercase tracking-widest">Ders</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Şu An</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Hedef</span>
            </div>

            {/* Rows */}
            <div className="space-y-3">
                {groups.map((group) => (
                    <div key={group.id} className="grid grid-cols-[1fr_84px_84px] gap-4 items-center">
                        <div className="font-medium text-gray-900 truncate pr-2">
                            {group.name}
                            <span className="text-[10px] text-gray-400 font-normal ml-1.5 align-middle">
                                /{group.max}
                            </span>
                        </div>

                        <input
                            type="number"
                            min="0"
                            max={group.max}
                            value={currentNets[group.id] || ''}
                            onChange={(e) => {
                                const val = Math.min(parseFloat(e.target.value) || 0, group.max);
                                onCurrentChange(group.id, val);
                            }}
                            className="w-full h-10 px-2 border-2 border-gray-100 rounded-lg focus:border-gray-900 focus:outline-none text-center font-bold text-lg text-black transition-colors"
                            placeholder="-"
                        />

                        <input
                            type="number"
                            min="0"
                            max={group.max}
                            value={targetNets[group.id] || ''}
                            onChange={(e) => {
                                const val = Math.min(parseFloat(e.target.value) || 0, group.max);
                                onTargetChange(group.id, val);
                            }}
                            className="w-full h-10 px-2 border-2 border-gray-100 rounded-lg focus:border-black focus:outline-none text-center font-bold text-lg bg-gray-50 focus:bg-white text-black transition-colors"
                            placeholder="-"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

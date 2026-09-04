import React from "react";

/**
 * DetectionStats
 *
 * Displays the results of hidden-character detection.
 * Shows each detected type, its count, and the total removed.
 *
 * Props:
 *   detections – Array<{ name: string, count: number }>
 *   total      – Total number of hidden characters found
 *   removed    – Number actually removed (0 until cleaning runs)
 */
function DetectionStats({ detections = [], total = 0, removed = 0 }) {
    if (total === 0 && removed === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        ✓
                    </span>
                    <div>
                        <p className="text-sm font-bold text-slate-900">
                            Nta Hidden Characters zibonetse
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Iyi nyandiko idafite invisible characters zihishe.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
                {removed > 0 ? "Ibisobanuro by'ibyo wahiswe" : "Hidden characters zibonetse"}
            </h3>

            <div className="space-y-2">
                {detections.map((d) => (
                    <div
                        key={d.name}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                    >
                        <span className="text-xs text-slate-600">
                            <span className="mr-1.5 text-emerald-500">✓</span>
                            {d.name}
                        </span>
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                            {d.count}
                        </span>
                    </div>
                ))}
            </div>

            {removed > 0 && (
                <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center">
                    <p className="text-xs font-bold text-emerald-700">
                        {removed.toLocaleString()} hidden characters
                        {removed !== 1 ? " zawese" : ""} zabaye zisibwa
                    </p>
                </div>
            )}
        </div>
    );
}

export default DetectionStats;

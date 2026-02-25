'use client';

interface TimelineStep {
  key: string;
  label: string;
  detail?: string;
}

interface StatusTimelineProps {
  status: 'submitted' | 'assigned' | 'in_review' | 'delivered';
  submittedAt: string;
  deadlineAt: string | null;
  deliveredAt: string | null;
  expertName?: string;
}

const STEPS: TimelineStep[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'assigned', label: 'Expert Assigned' },
  { key: 'in_review', label: 'In Review' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER = ['submitted', 'assigned', 'in_review', 'delivered'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function Countdown({ target }: { target: string }) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return <span className="text-red-500 font-semibold">Overdue</span>;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return <span className="font-semibold text-amber-600">{h}h {m}m remaining</span>;
}

export default function StatusTimeline({ status, submittedAt, deadlineAt, deliveredAt, expertName }: StatusTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  const details: Record<string, string | undefined> = {
    submitted: submittedAt ? formatDate(submittedAt) : undefined,
    assigned: expertName ? `Assigned to ${expertName}` : undefined,
    in_review: deadlineAt ? undefined : undefined,
    delivered: deliveredAt ? formatDate(deliveredAt) : undefined,
  };

  return (
    <div>
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} className="flex gap-4">
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                  done
                    ? active && status !== 'delivered'
                      ? 'bg-amber-400 text-white'
                      : 'text-white'
                    : 'bg-gray-100 text-gray-300'
                }`}
                  style={done && !(active && status !== 'delivered') ? { background: 'linear-gradient(to right,#FADB43,#fe9940)', color: '#141c52' } : undefined}>
                  {done && !active ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 h-8 mt-1 ${i < currentIdx ? 'bg-amber-300' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Content */}
              <div className="pb-6">
                <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-300'}`}>
                  {step.label}
                  {active && status !== 'delivered' && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">In progress</span>
                  )}
                </p>
                {details[step.key] && (
                  <p className="text-xs text-gray-500 mt-0.5">{details[step.key]}</p>
                )}
                {step.key === 'in_review' && active && deadlineAt && (
                  <p className="text-xs mt-0.5"><Countdown target={deadlineAt} /></p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

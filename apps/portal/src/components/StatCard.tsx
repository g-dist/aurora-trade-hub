import { ReactNode } from "react";

const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) => (
  <div className="bg-card rounded-xl border border-border p-5 hover:-translate-y-px transition-all duration-150 group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
      {icon && <div className="text-muted-foreground group-hover:text-accent transition-colors">{icon}</div>}
    </div>
  </div>
);

export default StatCard;

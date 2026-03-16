import { cn } from "@/lib/utils";

type StatusType = 'active' | 'in-stock' | 'low-stock' | 'on-order' | 'pending' | 'confirmed' | 'cancelled' | 'pre-order' | 'processing' | 'dispatched' | 'in-transit' | 'arrived' | 'delivered' | 'quote-sent' | 'negotiating' | 'expired' | 'pending-review' | 'limited' | 'completed';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  'active': { label: 'Active', className: 'bg-status-green/15 text-status-green' },
  'in-stock': { label: 'In Stock', className: 'bg-status-green/15 text-status-green' },
  'low-stock': { label: 'Low Stock', className: 'bg-status-amber/15 text-status-amber' },
  'on-order': { label: 'On Order', className: 'bg-status-blue/15 text-status-blue' },
  'pending': { label: 'Pending', className: 'bg-status-amber/15 text-status-amber' },
  'confirmed': { label: 'Confirmed', className: 'bg-status-green/15 text-status-green' },
  'cancelled': { label: 'Cancelled', className: 'bg-status-red/15 text-status-red' },
  'pre-order': { label: 'Pre-Order', className: 'bg-status-purple/15 text-status-purple' },
  'processing': { label: 'Processing', className: 'bg-status-amber/15 text-status-amber' },
  'dispatched': { label: 'Dispatched', className: 'bg-status-blue/15 text-status-blue' },
  'in-transit': { label: 'In Transit', className: 'bg-status-blue/15 text-status-blue' },
  'arrived': { label: 'Arrived', className: 'bg-status-green/15 text-status-green' },
  'delivered': { label: 'Delivered', className: 'bg-status-green/15 text-status-green' },
  'quote-sent': { label: 'Quote Sent', className: 'bg-status-blue/15 text-status-blue' },
  'negotiating': { label: 'Negotiating', className: 'bg-status-amber/15 text-status-amber' },
  'expired': { label: 'Expired', className: 'bg-status-red/15 text-status-red' },
  'pending-review': { label: 'Pending Review', className: 'bg-status-amber/15 text-status-amber' },
  'limited': { label: 'Limited Stock', className: 'bg-status-amber/15 text-status-amber' },
  'completed': { label: 'Completed', className: 'bg-status-green/15 text-status-green' },
};

const StatusBadge = ({ status }: { status: StatusType }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
export type { StatusType };

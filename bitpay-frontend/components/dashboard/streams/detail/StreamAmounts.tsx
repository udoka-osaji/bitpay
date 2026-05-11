"use client";

export interface StreamAmountsProps {
  totalAmount: string;
  vestedAmount: string;
  withdrawn: string;
  available: string;
  status?: string;
  vestedPaid?: string;
  unvestedReturned?: string;
}

export function StreamAmounts({
  totalAmount,
  vestedAmount,
  withdrawn,
  available,
  status,
  vestedPaid,
  unvestedReturned
}: StreamAmountsProps) {
  // Show different layout for cancelled streams
  if (status === 'cancelled') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
          <p className="text-2xl font-bold">{totalAmount}</p>
          <p className="text-xs text-muted-foreground">sBTC</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Vested (Paid to Recipient)</p>
          <p className="text-2xl font-bold text-green-600">{vestedPaid || '0.00000000'}</p>
          <p className="text-xs text-muted-foreground">sBTC</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Unvested (Returned to Sender)</p>
          <p className="text-2xl font-bold text-blue-600">{unvestedReturned || '0.00000000'}</p>
          <p className="text-xs text-muted-foreground">sBTC</p>
        </div>
      </div>
    );
  }

  // Normal active stream layout
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
        <p className="text-2xl font-bold">{totalAmount}</p>
        <p className="text-xs text-muted-foreground">sBTC</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Vested</p>
        <p className="text-2xl font-bold text-brand-teal">{vestedAmount}</p>
        <p className="text-xs text-muted-foreground">sBTC</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Withdrawn</p>
        <p className="text-2xl font-bold">{withdrawn}</p>
        <p className="text-xs text-muted-foreground">sBTC</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Available</p>
        <p className="text-2xl font-bold text-brand-pink">{available}</p>
        <p className="text-xs text-muted-foreground">sBTC</p>
      </div>
    </div>
  );
}

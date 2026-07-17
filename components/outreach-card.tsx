import { MailX, FileWarning } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface OutreachCardData {
  creatorHandle: string;
  creatorDisplayName: string;
  draftText: string | null;
  matchRationale: string;
}

export function OutreachCard({ data }: { data: OutreachCardData }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm">
          {data.creatorDisplayName}{' '}
          <span className="font-normal text-muted-foreground">@{data.creatorHandle}</span>
        </CardTitle>
        {data.draftText !== null && (
          <CardAction>
            <Badge variant="secondary" className="gap-1">
              <MailX />
              draft — never sent
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {data.draftText !== null ? (
          <p className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">{data.draftText}</p>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <FileWarning className="size-4 shrink-0" />
            Draft unavailable for this creator — try regenerating, or reach out manually.
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Why this creator</p>
          <p className="text-sm">{data.matchRationale}</p>
        </div>
      </CardContent>
    </Card>
  );
}

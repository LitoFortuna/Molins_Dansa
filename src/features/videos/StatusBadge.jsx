import { Badge } from '../../components/ui';
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';

export const StatusBadge = ({ status }) => {
  const s = status || 'aprovat';
  return <Badge color={STATUS_COLORS[s]}>{STATUS_LABELS[s]}</Badge>;
};

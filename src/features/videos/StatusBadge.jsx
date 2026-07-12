import { Badge } from '../../components/ui';
import { STATUS_COLORS } from '../../lib/constants';
import { useI18n } from '../../i18n/useI18n';

const STATUS_LABEL_KEYS = {
  pendent: 'admin.statusPending',
  aprovat: 'admin.statusApproved',
  rebutjat: 'admin.statusRejected',
};

export const StatusBadge = ({ status }) => {
  const { t } = useI18n();
  const s = status || 'aprovat';
  return <Badge color={STATUS_COLORS[s]}>{t(STATUS_LABEL_KEYS[s])}</Badge>;
};

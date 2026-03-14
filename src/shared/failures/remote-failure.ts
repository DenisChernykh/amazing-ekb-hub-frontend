import type { ApiFailure } from '@/shared/failures/api-failure';
import type { ContractFailure } from '@/shared/failures/contract-failure';
import type { TransportFailure } from '@/shared/failures/transport-failure';

/**
 * Объединение всех нормализованных ошибок remote-вызовов.
 */
export type RemoteFailure = ApiFailure | ContractFailure | TransportFailure;

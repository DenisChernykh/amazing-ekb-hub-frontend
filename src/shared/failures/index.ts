export { applyApiIssuesToForm } from './apply-api-issues-to-form';
export { getApiIssueMessage } from './get-api-issue-message';
export { getApiRootIssueMessages } from './get-api-root-issue-messages';
export { getRemoteFailureMessage } from './get-remote-failure-message';
export { isRetryableRemoteFailure } from './is-retryable-remote-failure';
export {
  isApiFailure,
  isAuthFailure,
  isContractFailure,
  isDomainFailure,
  isDomainFailureCode,
  isNotFoundFailure,
  isPermissionFailure,
  isServerFailure,
  isTransportFailure,
  isValidationFailure,
} from './remote-failure.guards';
export { splitApiIssuesByPath } from './split-api-issues-by-path';
export { toRemoteResult } from './to-remote-result';

export type {
  ApiFailure,
  AuthApiFailure,
  DomainApiFailure,
  FailureMeta,
  NotFoundApiFailure,
  PermissionApiFailure,
  ServerApiFailure,
  ValidationApiFailure,
} from './api-failure';
export type { ContractFailure, ContractFailureCode, ContractIssue } from './contract-failure';
export type { RemoteFailure } from './remote-failure';
export type { SplitApiIssuesByPathResult } from './split-api-issues-by-path';
export type { HttpSuccessMeta } from './to-remote-result';
export type { TransportFailure, TransportFailureCode } from './transport-failure';

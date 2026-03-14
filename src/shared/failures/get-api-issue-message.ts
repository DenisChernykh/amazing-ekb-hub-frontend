import type { ApiIssueCode } from '@/shared/failures/api-error-envelope';

const API_ISSUE_MESSAGES: Record<ApiIssueCode, string> = {
  required: 'Заполните поле',
  string: 'Введите текстовое значение',
  number: 'Введите числовое значение',
  boolean: 'Укажите корректное значение',
  email: 'Введите корректный email',
  url: 'Введите корректную ссылку',
  uuid: 'Укажите корректный идентификатор',
  date: 'Укажите корректную дату',
  array: 'Укажите список значений',
  object: 'Укажите корректное значение',
  min_length: 'Значение слишком короткое',
  max_length: 'Значение слишком длинное',
  min: 'Значение меньше допустимого',
  max: 'Значение больше допустимого',
  enum: 'Выберите значение из списка',
  unknown_property: 'Передано лишнее поле',
  PINNED_MATERIAL_MUST_BELONG_TO_PLACE: 'Материал должен принадлежать выбранному месту',
};

/**
 * Возвращает frontend-сообщение для `validation` или `domain` issue по его коду.
 *
 * @param code - Машиночитаемый issue-код из `error.details.issues[*].code`.
 * @returns Локализованное сообщение для показа в поле формы или в `root`.
 */
export function getApiIssueMessage(code: ApiIssueCode): string {
  return API_ISSUE_MESSAGES[code];
}

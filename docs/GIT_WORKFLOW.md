# Git Workflow: Linear + Squash

## 1. Цель

Сделать историю изменений предсказуемой и читаемой:

- линейная история в `stage` и `main`,
- один чистый коммит на каждую фичу в `stage`,
- безопасный релиз в `main` без merge-коммитов.

## 2. Базовые правила

1. Ветки проекта:
   - `main` — релизная ветка.
   - `stage` — интеграционная ветка.
2. Рабочая ветка создаётся только от `stage`.
3. Нейминг рабочей ветки: `<type>/<short-name>`.
4. Merge `<type>/<short-name> -> stage` только через **Squash and merge**.
5. Продвижение `stage -> main` только fast-forward:
   - `git merge --ff-only stage`
6. Сообщения коммитов: Conventional Commits.

## 3. Conventional Commits

Формат:
`type(scope): subject`

Примеры:

- `feat(rbac): add roles guard for admin endpoints`
- `fix(errors): normalize validation error payload`
- `docs(git): add release checklist`

Рекомендуемые `type`:

- `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `build`, `ci`, `revert`, `style`

## 4. Операционный чеклист (с командами, рисками и проверкой)

### 4.1 Начало работы над задачей

1. `git switch stage`
   Цель: перейти в интеграционную ветку как базу для новой работы.
   Риск: если есть незакоммиченные изменения, переход может быть заблокирован или привести к путанице.
   Проверка: `git branch --show-current` должен вернуть `stage`.
2. `git pull --ff-only origin stage`
   Цель: синхронизировать `stage` без создания merge-коммитов.
   Риск: команда завершится ошибкой, если нужен merge/rebase.
   Проверка: `git status -sb` и `git log --oneline -n 1`.
3. `git switch -c <type>/<short-name>`
   Цель: создать рабочую ветку с валидным именем.
   Риск: неверный шаблон имени ветки будет заблокирован проверками на push/CI.
   Проверка: `git branch --show-current`.

### 4.2 Синхронизация рабочей ветки с актуальным `stage`

1. `git fetch origin`
   Цель: получить свежие удалённые ссылки и коммиты.
   Риск: отсутствует, не меняет рабочие файлы.
   Проверка: `git branch -r | rg origin/stage`.
2. `git rebase origin/stage`
   Цель: наложить вашу работу поверх актуального `stage` и сохранить линейность.
   Риск: возможны конфликты.
   Проверка: `git log --graph --oneline --decorate -n 20`.
3. Если rebase нужно отменить: `git rebase --abort`
   Цель: безопасно вернуть состояние до начала rebase.
   Проверка: `git status`.

### 4.3 Публикация ветки и PR

1. `git push -u origin <type>/<short-name>`
   Цель: опубликовать ветку и установить upstream.
   Риск: pre-push проверки остановят push при нарушениях (это ожидаемо).
   Проверка: `git branch -vv`.
2. Создать PR `<type>/<short-name> -> stage` в интерфейсе хостинга и выбрать **Squash and merge**.

### 4.4 Релиз из `stage` в `main` (только fast-forward)

1. `git switch stage`
2. `git pull --ff-only origin stage`
3. `git switch main`
4. `git pull --ff-only origin main`
5. `git merge --ff-only stage`
   Цель: продвинуть `main` ровно на тот же линейный набор коммитов, что и в `stage`.
   Риск: если fast-forward невозможен, команда завершится ошибкой (и это правильно).
   Проверка: `git log --graph --oneline --decorate -n 30`.
6. `git push origin main`

## 5. Политика pull request и release

1. `stage` обновляется только через PR.
2. `main` обновляется только после зелёного CI.
3. Для `stage` и `main` нужно включить branch protection (если хостинг поддерживает):
   - Require pull request before merging.
   - Require status checks to pass.
   - Disallow merge commits.
   - Allow squash merge.
4. CI дополнительно валидирует направление PR:
   - в `stage` можно только из `<type>/<short-name>`,
   - в `main` можно только из `stage`.
5. Исторические merge-коммиты не переписываются; стандарт применяется к новым изменениям.

## 6. Проверки, которые должны проходить

1. `commit-msg` hook проверяет Conventional Commit.
2. Текущий обязательный локальный набор перед push / PR: `lint + typecheck + build`.
3. Команды `test:unit`, `test:e2e`, `test:coverage` являются целевым состоянием frontend и становятся обязательными только после их реального добавления в репозиторий.
4. CI на PR в `stage` и `main` должен как минимум воспроизводить текущие обязательные проверки.
5. После внедрения test tooling полный набор CI должен включать frontend unit/component и e2e-сценарии по `docs/testing/test-strategy.md`.


## 7. Быстрая диагностика истории

Команда:
`git log --graph --oneline --decorate --all`

Признак корректного процесса:

- в новых изменениях для `stage/main` нет новых merge-узлов от feature-веток,
- каждый PR в `stage` превращается в один squash-коммит.

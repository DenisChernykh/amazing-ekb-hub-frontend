# Git Workflow: PR Merge to Stage + Fast-Forward to Main

## 1. Цель

Сделать историю изменений предсказуемой и читаемой:

- feature-ветки попадают в `stage` обычным merge через PR;
- история `stage` сохраняет merge-коммиты PR и логические коммиты feature-веток;
- `main` продвигается из `stage` только fast-forward, без отдельного release merge-коммита;
- production deploy запускается только после проверок и берёт явно проверенный ref.

## 2. Базовые правила

1. Ветки проекта:
   - `main` — релизная ветка;
   - `stage` — интеграционная ветка.
2. Рабочая ветка создаётся только от актуального `stage`.
3. Нейминг рабочей ветки: `<type>/<short-name>`.
4. Merge `<type>/<short-name> -> stage` выполняется через обычный PR merge, без squash.
5. Продвижение `stage -> main` выполняется только fast-forward:

   ```bash
   git merge --ff-only stage
   ```

6. Обычный merge-коммит для release PR в `main` запрещён.
7. Исторические merge-коммиты не переписываются; правило применяется к новым изменениям.
8. Сообщения коммитов соответствуют Conventional Commits.

## 3. Conventional Commits

Формат:
`type(scope): subject`

Примеры:

- `feat(rbac): add roles guard for admin endpoints`
- `fix(errors): normalize validation error payload`
- `docs(git): add release checklist`

Рекомендуемые `type`:

- `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `build`, `ci`, `revert`, `style`.

## 4. Операционный чеклист

### 4.1 Начало работы над задачей

1. `git switch stage`

   Цель: перейти на интеграционную ветку как на базу для новой работы.

   Проверка:

   ```bash
   git branch --show-current
   git status -sb
   ```

2. `git pull --ff-only origin stage`

   Цель: синхронизировать `stage` без создания merge-коммита.

   Если команда завершается ошибкой, сначала нужно разобраться с расхождением веток.

3. `git switch -c <type>/<short-name>`

   Цель: создать рабочую ветку от проверенного `stage`.

### 4.2 Синхронизация рабочей ветки с актуальным `stage`

1. `git fetch --prune origin`

   Цель: получить свежие удалённые refs. Команда не меняет рабочие файлы.

2. `git rebase origin/stage`

   Цель: наложить работу поверх актуального `stage` и заранее увидеть конфликты.

   Отмена rebase:

   ```bash
   git rebase --abort
   ```

3. Проверить историю:

   ```bash
   git log --graph --oneline --decorate -n 20
   ```

### 4.3 Публикация ветки и PR в `stage`

1. `git push -u origin <type>/<short-name>`

   Перед push должны пройти локальные pre-push проверки.

2. Создать PR `<type>/<short-name> -> stage`.

3. После зелёного CI выбрать обычный merge commit (`Create a merge commit` / `Merge pull request`), не squash.

Так `stage` сохраняет полный контекст feature-ветки. Это разрешённые merge-коммиты интеграционной ветки, а не release merge-коммиты в `main`.

### 4.4 Релиз из `stage` в `main`: только fast-forward

1. Обновить refs и проверить предка:

   ```bash
   git fetch --prune origin
   git merge-base --is-ancestor origin/main origin/stage
   ```

   Код возврата `0` означает, что `main` можно продвинуть до `stage` fast-forward.

2. Синхронизировать локальные ветки:

   ```bash
   git switch stage
   git pull --ff-only origin stage
   git switch main
   git pull --ff-only origin main
   ```

3. Продвинуть `main` без merge-коммита:

   ```bash
   git merge --ff-only stage
   git push origin main
   ```

4. Проверить результат:

   ```bash
   git rev-parse main stage
   git rev-list --left-right --count main...stage
   git log --graph --oneline --decorate -n 30
   ```

   После успешного fast-forward `main` и `stage` указывают на один commit, а `git rev-list --left-right --count main...stage` возвращает `0 0`.

Если branch protection запрещает прямой push в `main`, release automation должна выполнить тот же fast-forward под контролируемыми правами. В интерфейсе GitHub нельзя выбирать обычный `Merge pull request` для release PR.

### 4.5 Прямой production deploy проверенного `stage`

Обычный production workflow запускается при push в `main`, но также поддерживает `workflow_dispatch`.

Если нужно выкатить именно текущий `stage` без изменения `main`:

1. Обновить `origin/stage` и проверить commit.
2. В GitHub Actions открыть `deploy-production`.
3. Нажать `Run workflow` и выбрать ref `stage`.
4. Дождаться jobs `quality`, `build-image` и `deploy`.
5. Проверить frontend URL и API proxy `/v1/health/live`.

Такой режим является прямым production deploy из `stage`, а не release в `main`; его нужно использовать осознанно.

## 5. Политика pull request и release

1. `stage` обновляется только через PR.
2. Для PR в `stage` разрешён обычный merge commit; squash не используется.
3. `main` обновляется только из `stage` после зелёного CI.
4. Обычные merge-коммиты в `main` запрещены.
5. В `main` нельзя направлять feature PR напрямую; release source — только `stage`.
6. Branch protection должна:
   - требовать PR и обязательные status checks для `stage`;
   - разрешать merge commits в `stage`;
   - запрещать squash для feature PR в `stage`;
   - запрещать обычные merge-коммиты в `main`;
   - разрешать только fast-forward/линейный release-путь из `stage`.
7. CI дополнительно проверяет направление PR:
   - в `stage` можно только из `<type>/<short-name>`;
   - в `main` можно только из `stage`.

## 6. Проверки, которые должны проходить

1. `commit-msg` hook проверяет Conventional Commit.
2. `pre-commit` запускает `lint-staged` и форматирует staged-файлы.
3. `pre-push` проверяет имя ветки, форматирование, lint, unit-тесты, typecheck и build.
4. Полный frontend-набор:

   ```bash
   pnpm run format:check
   pnpm run lint:strict
   pnpm run test:unit
   pnpm run typecheck
   pnpm run build
   ```

   `typecheck` и `build` запускаются последовательно, потому что используют артефакты `.next`.

5. CI на PR в `stage` и `main` воспроизводит этот набор и проверяет направление PR.

## 7. Быстрая диагностика истории

```bash
git log --graph --oneline --decorate --all
git rev-list --left-right --count origin/main...origin/stage
git merge-base --is-ancestor origin/main origin/stage
git log --merges origin/main..origin/stage
```

Корректное состояние release-пути:

- `origin/main` является предком `origin/stage` перед fast-forward release;
- после release refs `main` и `stage` совпадают;
- новые merge-коммиты допустимы внутри `stage`, но не добавляются поверх `stage` в `main`;
- если fast-forward невозможен, команда завершается ошибкой, а историю не нужно исправлять дополнительным merge.

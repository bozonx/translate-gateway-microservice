# CHANGELOG

## Unreleased

- README ориентирован на production-использование (убраны dev-инструкции)
- Добавлен `docs/dev.md` с инструкциями по разработке и dev-режиму
- Уточнены prod URL и Docker Compose команды в README
- В разделе env добавлено упоминание `TZ` и что источником истины является `.env.production.example`

## 0.15.0 — Boilerplate refactor

- Полностью удалены функциональности STT, GraphQL и Auth
- Оставлен только модуль Health (простой health-check)
- Упрощены конфиги окружения (`.env.*`)
- Обновлён `AppModule` и логирование (service: `nestjs-boilerplate`)
- Очищены и пересобраны тесты (unit + e2e только для health)
- Переработан `docker-compose.yml` до минимального примера (локальная сборка)
- Обновлён `README.md` (рус.)
- Удалены устаревшие документы в `docs/` (STT/Auth/GraphQL)

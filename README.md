# Teacher Frontend

В папке `front` находится frontend для учителей.

Это отдельное `React + TypeScript + Vite` приложение, которое работает с backend `ione`.

## Что уже реализовано

- авторизация учителя через `POST /api/auth/login`
- проверка текущей сессии через `GET /api/me`
- загрузка списка учеников риска через `GET /api/teacher/risk-students`
- просмотр детальной информации по попытке через `GET /api/teacher/test-attempts/{attemptId}`
- хранение JWT в `localStorage`

## Что умеет интерфейс

- вход только для пользователя с ролью `TEACHER`
- ручной ввод `testId`
- выбор минимальной зоны риска: `YELLOW`, `RED`, `BLACK`, `GREEN`
- список найденных учеников
- детальный просмотр:
  - информации об ученике и тесте
  - зон риска по категориям
  - всех ответов ученика

## Почему `testId` вводится вручную

В текущем backend для учителя нет отдельного эндпоинта, который возвращает список тестов.
Поэтому во фронте сейчас используется ручной ввод `testId`.

## Запуск

Открой терминал в папке `front` и выполни:

```powershell
npm.cmd install
npm.cmd run dev
```

После запуска dev-сервера приложение будет доступно обычно по адресу:

```text
http://localhost:5173
```

## Backend

По умолчанию frontend ожидает backend по адресу:

```text
http://localhost:8081
```

Перед запуском frontend желательно поднять `ione`.

## Настройка адреса API

Если backend работает не на `http://localhost:8081`, можно указать переменную окружения:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8081"
npm.cmd run dev
```

## Production build

Для production-сборки:

```powershell
npm.cmd run build
```

Готовые файлы будут в папке `front/dist`.

## Основные файлы

- `src/App.tsx` - основной teacher UI
- `src/api.ts` - запросы к backend
- `src/storage.ts` - сохранение сессии
- `src/types.ts` - типы данных
- `src/styles.css` - стили интерфейса

## Документация по API

Описание backend API находится в файле:

- `front/readme_api.md`

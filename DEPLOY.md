# Инструкция по деплою на GitHub Pages

## Шаг 1: Создание репозитория на GitHub

1. Откройте https://github.com
2. Нажмите кнопку **"+"** в правом верхнем углу → **"New repository"**
3. Заполните:
   - **Repository name**: `so-start-grid` (или другое имя)
   - **Visibility**: Public или Private (GitHub Pages работает с обоими)
   - **НЕ** добавляйте README, .gitignore, license (у вас уже есть)
4. Нажмите **"Create repository"**

## Шаг 2: Настройка имени репозитория

⚠️ **ВАЖНО**: Если ваше имя репозитория отличается от `so-start-grid`, нужно изменить `base` в `vite.config.ts`:

Откройте `vite.config.ts` и замените `/so-start-grid/` на `/ВАШЕ_ИМЯ_РЕПОЗИТОРИЯ/`

Например, если репозиторий называется `my-app`, то должно быть:
```typescript
base: process.env.NODE_ENV === 'production' ? '/my-app/' : '/',
```

## Шаг 3: Подключение к GitHub

Выполните в терминале (замените `YOUR_USERNAME` на ваш GitHub username):

```bash
# Добавить удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/so-start-grid.git

# Отправить код на GitHub
git branch -M main
git push -u origin main
```

## Шаг 4: Настройка GitHub Actions для автоматического деплоя

✅ Файл `.github/workflows/deploy.yml` уже создан в проекте. Ничего делать не нужно!

## Шаг 5: Включение GitHub Pages

1. Перейдите в репозиторий на GitHub
2. Откройте **Settings** → **Pages**
3. В разделе **Source** выберите:
   - **Source**: `GitHub Actions` (это новая опция, не Branch!)
   
   ⚠️ **Важно**: На странице вы увидите карточки с готовыми workflow (Jekyll, Static HTML) — **игнорируйте их**! У вас уже есть свой workflow файл `.github/workflows/deploy.yml`, который будет работать автоматически.
   
   ⚠️ **Если вы не видите опцию "GitHub Actions"**, выберите:
   - **Source**: `Deploy from a branch`
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
   
   (Ветка `gh-pages` будет создана автоматически после первого запуска GitHub Actions)
4. Нажмите **Save** (если нужно)

## Шаг 6: Проверка

Через несколько минут после пуша ваше приложение будет доступно по адресу:
`https://YOUR_USERNAME.github.io/so-start-grid/`

## Важные замечания

- После первого деплоя может потребоваться несколько минут
- GitHub Actions автоматически будет деплоить при каждом push в ветку `main`
- Если вы используете custom domain, не забудьте добавить `CNAME` файл


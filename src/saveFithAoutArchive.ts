import express from "express";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Настройка приложения
const app = express();
const port = 3000;

// Настройка для обслуживания статических файлов из папки "public"
app.use(express.static(path.join(__dirname, 'public')));

// Настройка multer для загрузки нескольких файлов
const upload = multer({
  dest: "uploads/", // Временная директория для загрузки
});

// Путь к значку
const watermarkPath = path.resolve("assets", "watermark.png");

// Убедимся, что директория для сохранения обработанных файлов существует
const processedDir = "processed";
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir);
}

// Обработчик загрузки и обработки нескольких изображений
app.post("/process-images", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).send("Файлы не были загружены.");
      return;
    }

    const processedFiles: string[] = []; // Массив путей к обработанным файлам

    // Обрабатываем каждый файл
    for (let file of files) {
      const inputPath = file.path;
      const outputPath = `processed/${file.filename}-processed.png`;

      // Получаем метаданные изображения для определения его размера
      const metadata = await sharp(inputPath).metadata();

      const imageHeight = metadata.height || 0; // Высота изображения
      const imageWidth = metadata.width || 0; // Ширина изображения

      // Обработка изображения с наложением значка
      await sharp(inputPath)
        .composite([
          {
            input: watermarkPath,
            gravity: "southwest", // Нижний левый угол
            // Позиционируем водяной знак относительно высоты изображения
            top: imageHeight - 200, // 100px от нижнего края изображения
            left: 10, // 10px от левого края
          },
        ])
        .toFile(outputPath);

      processedFiles.push(outputPath);
    }

    // Отправляем ответ с именами обработанных файлов
    res.json({ message: "Файлы успешно обработаны", files: processedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при обработке изображений.");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

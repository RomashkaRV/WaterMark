"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000; // Порт из переменных окружения
// Настройки сервера
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Настройка загрузки файлов в память
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const watermarkPath = path_1.default.resolve("assets", "watermark.png");
// Обработчик для загрузки и обработки изображений
app.post("/process-images", upload.array("images", 10), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const processedFiles = [];
        for (let file of files) {
            // Обрабатываем изображение в памяти
            const metadata = yield (0, sharp_1.default)(file.buffer).metadata();
            const imageHeight = metadata.height || 0;
            const processedImage = yield (0, sharp_1.default)(file.buffer)
                .composite([
                {
                    input: watermarkPath,
                    gravity: "southwest",
                    top: imageHeight - 200,
                    left: 10,
                },
            ])
                .toBuffer(); // Сохраняем результат в буфер
            processedFiles.push(processedImage);
        }
        // Создаем архив с обработанными изображениями
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        res.attachment("processed-images.zip");
        archive.pipe(res);
        for (let i = 0; i < processedFiles.length; i++) {
            // Добавляем обработанное изображение в архив
            archive.append(processedFiles[i], { name: `processed-${i + 1}.png` });
        }
        archive.finalize();
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Ошибка обработки");
    }
}));
// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var multer_1 = __importDefault(require("multer"));
var sharp_1 = __importDefault(require("sharp"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// Настройка приложения
var app = (0, express_1.default)();
var port = 3000;
// Настройка для обслуживания статических файлов из папки "public"
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Настройка multer для загрузки нескольких файлов
var upload = (0, multer_1.default)({
    dest: "uploads/", // Временная директория для загрузки
});
// Путь к значку
var watermarkPath = path_1.default.resolve("assets", "watermark.png");
// Убедимся, что директория для сохранения обработанных файлов существует
var processedDir = "processed";
if (!fs_1.default.existsSync(processedDir)) {
    fs_1.default.mkdirSync(processedDir);
}
// Обработчик загрузки и обработки нескольких изображений
app.post("/process-images", upload.array("images", 10), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var files, processedFiles, _i, files_1, file, inputPath, outputPath, metadata, imageHeight, imageWidth, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                files = req.files;
                if (!files || files.length === 0) {
                    res.status(400).send("Файлы не были загружены.");
                    return [2 /*return*/];
                }
                processedFiles = [];
                _i = 0, files_1 = files;
                _a.label = 1;
            case 1:
                if (!(_i < files_1.length)) return [3 /*break*/, 5];
                file = files_1[_i];
                inputPath = file.path;
                outputPath = "processed/".concat(file.filename, "-processed.png");
                return [4 /*yield*/, (0, sharp_1.default)(inputPath).metadata()];
            case 2:
                metadata = _a.sent();
                imageHeight = metadata.height || 0;
                imageWidth = metadata.width || 0;
                // Обработка изображения с наложением значка
                return [4 /*yield*/, (0, sharp_1.default)(inputPath)
                        .composite([
                        {
                            input: watermarkPath,
                            gravity: "southwest", // Нижний левый угол
                            // Позиционируем водяной знак относительно высоты изображения
                            top: imageHeight - 200, // 100px от нижнего края изображения
                            left: 10, // 10px от левого края
                        },
                    ])
                        .toFile(outputPath)];
            case 3:
                // Обработка изображения с наложением значка
                _a.sent();
                processedFiles.push(outputPath);
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5:
                // Отправляем ответ с именами обработанных файлов
                res.json({ message: "Файлы успешно обработаны", files: processedFiles });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error(error_1);
                res.status(500).send("Ошибка при обработке изображений.");
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Запуск сервера
app.listen(port, function () {
    console.log("\u0421\u0435\u0440\u0432\u0435\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u043D\u0430 http://localhost:".concat(port));
});

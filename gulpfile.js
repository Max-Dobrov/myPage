"use strict";

const {src, dest} = require("gulp"); //два метода ГАЛЬПА. src()- возвращает папку, откуда gulp берет файлы. метод dest() - возвращает скомпиленные файлы из src и кладёт их в папку, переданную в кач. аргумента. pipe(dest(path.build.css))
const gulp = require("gulp"); //(npm i gulp --save-dev) модуль gulp
const autoprefixer = require("gulp-autoprefixer"); //(npm i gulp-autoprefixer --save-dev) проставление префиксоф для css файлов
const cssbeautify = require("gulp-cssbeautify"); //(npm i gulp-cssbeautify --save-dev)красивый css файл с красивыми отступами и т.д.
const removeComments = require("gulp-strip-css-comments"); //(npm i gulp-strip-css-comments --save-dev)удалене комментариев минифицированного css файла
const rename = require("gulp-rename"); //(npm i gulp-rename --save-dev)для изменения названий файла (file.css -> file.min.css)
const sass = require("gulp-sass"); //(npm i gulp-sass --save-dev) компилятор SASS в CSS
const cssnano = require("gulp-cssnano"); //(npm i gulp-cssnano --save-dev)для сжатия css файла
const rigger = require("gulp-rigger"); //(npm i gulp-rigger --save-dev) склеивание разных js файлов в один большой файл
const uglify = require("gulp-uglify"); //(npm i gulp-uglify --save-dev) сжатите js файлов
const plumber = require("gulp-plumber"); //(npm i gulp-plumber --save-dev) при ошибках в js коде таска не слетает другие gulp таски и gulp
const imagemin = require("gulp-imagemin"); //(npm i gulp-imagemin --save-dev) сжатие и оптимизация изображений
const del = require("del"); //(npm i del --save-dev)очистка папки скомпелированного сайта от ненужных(устаревших/неактуальных) файлов
const panini = require("panini"); //(npm i panini --save-dev)создание html- шаблонов, фрагментов кода и подключения их в html-файлах(не шаблонизатор)
const browsersync = require("browser-sync").create(); //(npm i browser-sync --save-dev) локальный сервер



/* Paths */

var path = {    // пути, куда помещаем скомпелированные файлы из исходников
    build: {
        html: "dist/", // Директория, в которую билдится файлы html
        js: "dist/assets/js/", // Директория, в которую билдится файлы js
        css: "dist/assets/css/", // Директория, в которую билдится файлы css
        images: "dist/assets/img/" // Директория, в которую билдится файл
    },
    src: {      // пути для исходников
        html: "src/*.html", // все HTML
        js: "src/assets/js/*.js", // все JS
        css: "src/assets/sass/style.scss", // только style.scss
        images: "src/assets/img/**/*.{jpg,png,svg,ico,gif}" //все подпапки, все файлы с перечисл. расширениями
    },
    watch: {    // пути к файлам для наблюдения их изменения (для перезагрузки страницы, срабатывание тасков, переноса файлов)
        html: "src/**/*.html", //(все подпапки, все файлы) подпапки панини(для шаблонов, фрагментов кода)
        js: "src/assets/js/**/*.js", //(все подпапки, все файлы) компоненты в подпапках
        css: "src/assets/sass/**/*.scss", //(все подпапки, все файлы) blocks
        images: "src/assets/img/**/*.{jpg,png,svg,ico,gif}"
    },
    clean: "./dist" // путь для очистки папки со скомпелироваными файлами

};


/* Tasks */

function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 3000
    });
}

function browserSyncReload(done) {
    browsersync.reload();
}

function html() { //таск для работы с html файлами
    panini.refresh(); // метод panini, перед сборкой HTML при измененияхв в папках layouts, partials обновит содержим. папок
    return src(path.src.html, { base: "src/" }) //метод ГАЛЬПА под названием src, в него передаём ссылку на св-во src объекта path(пути к исходникам), чтоб gulp получил исходники. base страхует при неккоректной работе по переносу файлов
        .pipe(plumber()) //предотвращениt поломок при переносе из src в dist
        .pipe(panini({
            root: 'src/',                   // папка со страницами (Index.html, about.html и тд)
            layouts: 'src/tpl/layouts/',    // папка с шаблонами страниц
            partials: 'src/tpl/partials/',  // отдельные фрагменты(шаблоны) кода, например шапка сайта, тэг Head, футер и тд. С помощью конструкций подключ на разн. стр
            helpers: 'src/tpl/helpers/',
            data: 'src/tpl/data/'
        }))
        .pipe(dest(path.build.html)) //dest - метод ГАЛЬПА под названием, который копирует сбилденый html из src в папку dist
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css, { base: "src/assets/sass/" })
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            Browserslist: ['last 8 versions'],
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js, {base: './src/assets/js/'})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream()); //перезагрузка сервера при изменениях
}

function images() {
    return src(path.src.images)
        .pipe(imagemin())
        .pipe(dest(path.build.images));
}

function clean() {
    return del(path.clean);
}

function watchFiles() { //конструкция gulp.watch следит за указанными файлами, при изменении выполняет соответствующий таск.
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images)); //сначала clean выполняет очистку, далее gulp.parallel запускает все наши таски
const watch = gulp.parallel(build, watchFiles, browserSync);



/* Exports Tasks */ //чтобы таски можно было запускать в баше
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;

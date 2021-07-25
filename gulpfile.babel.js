import gulp from 'gulp'
import babel from 'gulp-babel'
import terser from 'gulp-terser'
import concat from 'gulp-concat'
import htmlmin from 'gulp-htmlmin'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import postcss from 'gulp-postcss'
import GulpPug from 'gulp-pug'
import GulpSass from 'gulp-sass'
import clean from 'gulp-purgecss'
import cacheBust from 'gulp-cache-bust'
import NodeSass from 'node-sass'
import imagemin from 'gulp-imagemin'
import browserSync from 'browser-sync'
import gulpPlumber from 'gulp-plumber' //Notidica el error , pero no se corta el desarrollo

const sass = GulpSass(NodeSass)
const {init: server, stream, reload} = browserSync //inyeccion del css en el codigo

const production =false

const cssPlugins = [
  cssnano(),
  autoprefixer(),
]

gulp.task('sass', () => {
  return gulp
    .src('./src/scss/styles.scss')
    .pipe(gulpPlumber())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(concat('styles.min.css'))
    .pipe(postcss(cssPlugins))
    .pipe(gulp.dest('./dist/css'))
    .pipe(stream())
})

gulp.task('clean', () => {
  return gulp
    .src('./dist/css/styles.min.css')
    .pipe(gulpPlumber())
    .pipe(clean({
      content: ['./dist/*.html']
    }))
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('views', () => {
  return gulp
    .src('./src/views/pages/*.pug')
    .pipe(gulpPlumber())
    .pipe(GulpPug({
      pretty: production ? false : true
    }))
    .pipe(cacheBust({type: 'timestamp'}))
    .pipe(gulp.dest('./dist'))
})

gulp.task('styles', () => {
  return gulp
    .src('./src/css/*.css')
    .pipe(gulpPlumber())
    .pipe(concat('styles.min.css'))
    .pipe(postcss(cssPlugins))
    .pipe(gulp.dest('./dist/css'))
    .pipe(stream())
})

gulp.task('htmlmin', () => {
  return gulp
    .src('./src/*.html')
    .pipe(gulpPlumber())
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
    }))
    .pipe(cacheBust({type: 'timestamp'}))
    .pipe(gulp.dest('./dist'))
})

gulp.task('babel', () => {
  return gulp
    .src('./src/js/*.js')
    .pipe(gulpPlumber())
    .pipe(concat('scripts.min.js'))
    .pipe(babel({presets:['@babel/env']}))
    .pipe(terser())
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('static', () => {
  return gulp
    .src('./src/static/*')
    .pipe(gulpPlumber())
    .pipe(gulp.dest('./dist/static'))
})

gulp.task('imagemin', () => {
  return gulp
    .src('./src/images/*')
    .pipe(gulpPlumber())
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality:30, progressive: true}),
      imagemin.optipng({optimizationLevel: 1}),
    ]))
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('default', () => {
  server({
    server: './dist'
  })
  // gulp.watch('./src/css/*.css', gulp.series('styles'))
  // gulp.watch('./src/view/**/*.pug', gulp.series('views')).on('change', reload)
  gulp.watch('./src/*.html', gulp.series('htmlmin')).on('change', reload)
  gulp.watch('./src/images/*', gulp.series('imagemin'))
  gulp.watch('./src/scss/**/*.scss', gulp.series('sass'))
  gulp.watch('./src/js/*.js', gulp.series('babel')).on('change', reload)
  gulp.watch('./src/static/*', gulp.series('static')).on('change', reload)
})
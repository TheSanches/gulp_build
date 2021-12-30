import gulp from 'gulp';
import webpack from 'webpack-stream';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cssmin from 'gulp-cssmin';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';

const { series, parallel, src, dest, watch } = gulp;

const paths = {
  scripts: {
    src: './src/js/main.js',
    dest: './dist/js',
    allScripts: './src/js/**/*.js'
  },
  styles: {
    src: './src/sass/*.sass',
    dest: './dist/css',
    allStyles: './src/sass/**/*.sass'
  },
  img: {
    src: './src/img/*',
    dest: './dist/img/',
  },
  html: {
    src: './src/*.html',
    dest: './dist',
  },
  server: {
    base: './dist'
  }
};

// ========================================
// build js
// ========================================

function buildJs() {
  return src(paths.scripts.src)
  .pipe(webpack({
    mode: 'production',
    output: {
        filename: 'build.js'
    },
    watch: false,
    devtool: "source-map",
    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            resolve: {
              fullySpecified: false
            },
            use: {
              loader: 'babel-loader',
              options: {
                presets: [['@babel/preset-env', {
                  corejs: 3,
                  useBuiltIns: "usage"
                }]]
              }
            }
          }
         
        ]
      }
  }))
  .pipe(gulp.dest(paths.scripts.dest));
}

export const runBuildJs = buildJs;

// ========================================
// build css
// ========================================

const sass = gulpSass(dartSass);

function buildStules() {
  return src(paths.styles.src, { sourcemaps: true })
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
        cascade: false
      }))
      .pipe(cssmin())
      .pipe(dest(paths.styles.dest, { sourcemaps: '.' }));
}

export const runBuildStules = buildStules;

// ========================================
// Minify PNG, JPEG, GIF and SVG images
// ========================================

function imagesMin(){
  return src(paths.img.src)
        .pipe(imagemin())
        .pipe(dest(paths.img.dest));
}

export const runImagesMins = imagesMin;

// ========================================
// build html
// ========================================

function html() {
  return src(paths.html.src)
        .pipe(dest(paths.html.dest));
}

export const runHtml = html;

// ========================================
// browsersync
// ========================================

const server = browserSync.create();

function reload(cd) {
  server.reload();
  cd();
}

function serve(cd) {
  server.init({
    server: {
      baseDir: paths.server.base
    }
  });
  cd();
}

// ========================================
// watching
// ========================================

function watching(cd) {

	watch(paths.styles.allStyles, series(buildStules, reload));
  watch(paths.html.src, series(runHtml, reload));
  watch(paths.scripts.allScripts, series(buildJs, reload));
  watch(paths.img.src, series(runImagesMins, reload));

  cd();

}

const dev = series(series(runHtml, runBuildStules, runBuildJs, runImagesMins), serve, watching);
export default dev;
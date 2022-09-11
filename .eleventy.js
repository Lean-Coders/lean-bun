const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
  // Disable automatic use of your .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Merge data instead of overriding
  eleventyConfig.setDataDeepMerge(true);

  // human readable date
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  eleventyConfig.addFilter("totalScore", (testers) => {
    return (
      Math.round(
        (testers.reduce(
          (sum, { review }) =>
            sum +
            [
              review.bunScore,
              review.pattyScore,
              review.timingScore,
              review.drinksScore,
              review.varietyScore,
              review.ingredientScore,
              review.valueForMoneyScore,
              review.serviceScore,
              review.ambienteScore,
            ].reduce((acc, curr) => acc + curr, 0) /
              9,
          0
        ) /
          testers.length) *
          2
      ) / 2
    );
  });

  eleventyConfig.addFilter("testerScore", ({ review }) => {
    return (
      Math.round(
        ([
          review.bunScore,
          review.pattyScore,
          review.timingScore,
          review.drinksScore,
          review.varietyScore,
          review.ingredientScore,
          review.valueForMoneyScore,
          review.serviceScore,
          review.ambienteScore,
        ].reduce((acc, curr) => acc + curr, 0) /
          9) *
          2
      ) / 2
    );
  });

  // Syntax Highlighting for Code blocks
  eleventyConfig.addPlugin(syntaxHighlight);

  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/alpinejs/dist/cdn.min.js": "./static/js/alpine.js",
    "./node_modules/prismjs/themes/prism-tomorrow.css":
      "./static/css/prism-tomorrow.css",
  });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/img");

  // Copy Uploads Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/uploads");

  // Minify HTML
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath.endsWith(".njk")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  // Let Eleventy transform HTML files as nunjucks
  // So that we can use .html instead of .njk
  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};

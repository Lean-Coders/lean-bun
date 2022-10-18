const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require("html-minifier");
const { readFileSync } = require("fs");
const { join } = require("path");

module.exports = function (eleventyConfig) {
  // Disable automatic use of your .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Merge data instead of overriding
  eleventyConfig.setDataDeepMerge(true);

  //#region Filters

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  eleventyConfig.addFilter("loadTesterJson", (tester) => {
    return JSON.parse(
      readFileSync(join(__dirname, "src/_reviews", tester + ".json"), "utf-8")
    );
  });

  eleventyConfig.addFilter("loadTestersJson", (testers) => {
    const testersJson = [];
    for (const tester of testers ?? []) {
      testersJson.push(
        JSON.parse(
          readFileSync(
            join(__dirname, "src/_reviews", tester + ".json"),
            "utf-8"
          )
        )
      );
    }
    return testersJson;
  });

  const getReviewValueArray = (review) => {
    const { name, restaurant, burger, ...scores } = review;
    return Object.values(scores).filter((val) => val > 0);
  };

  eleventyConfig.addFilter("totalScore", (testers) => {
    if (testers.length === 0) return 6;
    return (
      Math.round(
        (testers.reduce(
          (sum, review) =>
            sum +
            getReviewValueArray(review).reduce((acc, curr) => acc + curr, 0) /
              getReviewValueArray(review).length,
          0
        ) /
          testers.length) *
          2
      ) / 2
    );
  });

  eleventyConfig.addFilter("testerScore", (review) => {
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

  //#endregion

  //#region Shortcodes

  eleventyConfig.addNunjucksShortcode("rating", function (score, size) {
    return `<span
            class="h-[${size}px] w-[${size * 5}px] rating relative text-primary"
            style="--rating:${(6 - score) % 6}; --size: ${size}px"
          ></span>`;
  });

  //#endregion

  // Syntax Highlighting for Code blocks
  eleventyConfig.addPlugin(syntaxHighlight);

  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/alpinejs/dist/cdn.min.js": "./static/js/alpine.js",
    "./node_modules/prismjs/themes/prism-tomorrow.css":
      "./static/css/prism-tomorrow.css",
    "./src/static/css/font-faces.css": "./static/css/font-faces.css",
  });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/img");

  // Copy Uploads Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/uploads");

  // Copy Fonts Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/fonts");

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

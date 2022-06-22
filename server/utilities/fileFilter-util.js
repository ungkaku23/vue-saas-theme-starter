/* filter image upload function */
const imagesFilter = function(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Wrong file type");
    error.code = "LIMIT_FILE_TYPES";

    return cb(error, false);
  }
};

module.exports.imagesFilter = imagesFilter;

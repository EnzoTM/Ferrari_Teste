const express = require("express")
const router = express.Router()
const upload = require("../imguploadconfig/multer")

const imgcontroller = require("../controllers/ImgController")

router.post("/", upload.single("file"), imgcontroller.create)

module.exports = router;
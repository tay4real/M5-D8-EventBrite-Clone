const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mailgun = require("mailgun-js")({ apiKey, domain });

const cloudinary = require("../../cloudinary");
const { getattendees, writeattendees } = require("../../fsUtilities");

const attendeesRouter = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "striveTest",
  },
});

const cloudinaryMulter = multer({ storage: storage });

attendeesRouter.post(
  "/",
  cloudinaryMulter.single("image"),
  async (req, res, next) => {
    try {
      const attendees = await getattendees();

      attendees.push({
        ...req.body,
        img: req.file.path,
      });

      await writeattendees(attendees);
      res.json(attendees);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

attendeesRouter.post("/sendEmail", async (req, res, next) => {
  try {
    const data = {
      from: `Ademuyiwa Otubusin <tay4real@gmail.com>`,
      to: `ademuyiwa@gmail.com`,
      subject: "Attendee Event",
      text:
        "We are happy to inform you that you are accepted to participate in our event",
      html: "<strong>See you soon</strong>",
    };

    await mailgun.messages().send(data);
    res.send("sent");
  } catch (error) {
    next(error);
  }
});

module.exports = attendeesRouter;

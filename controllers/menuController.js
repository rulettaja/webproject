const express = require("express");
const router = express.Router();
const menuData = require("../data/menu.template.json");

router.get("/drinks", (req, res) => {
  res.json(menuData.weeklyMenus);
});

router.get("/drinks/today", (req, res) => {
  const dayMap = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];
  const todayKey = dayMap[new Date().getDay()];
  const todayMenu = menuData.weeklyMenus.find((d) => d.dayKey === todayKey);

  if (!todayMenu) {
    return res.status(404).json({ message: "No menu for today" });
  }

  res.json(todayMenu);
});

module.exports = router;


const User = require("../models/User");

const getContacts = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const query = {
      _id: { $ne: req.user._id },
    };

    if (search) {
      query.userId = { $regex: search, $options: "i" };
    }

    const users = await User.find(query)
      .select("_id name userId")
      .sort({ name: 1 })
      .limit(100);

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

module.exports = { getContacts };
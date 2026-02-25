const User = require("../models/User");
const Message = require("../models/Message");
const { uploadToCloudinary } = require("../config/cloudinary");

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
      .select("_id name userId profilePhoto caption")
      .sort({ name: 1 })
      .limit(100);

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

const getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chatUsers = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          otherUserId: {
            $cond: [{ $eq: ["$sender", currentUserId] }, "$receiver", "$sender"],
          },
          createdAt: 1,
          unreadValue: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiver", currentUserId] },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$otherUserId",
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: { $sum: "$unreadValue" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          userId: "$user.userId",
          profilePhoto: "$user.profilePhoto",
          caption: "$user.caption",
          unreadCount: 1,
        },
      },
    ]);

    return res.status(200).json({ users: chatUsers });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch recent chats" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const name = (req.body.name || user.name || "").trim();
    const caption = (req.body.caption || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (caption.length > 120) {
      return res.status(400).json({ message: "Caption must be 120 characters or less" });
    }

    let profilePhoto = user.profilePhoto || "";
    if (req.file) {
      profilePhoto = await uploadToCloudinary(req.file, "chat-app/profiles");
    }

    user.name = name;
    user.caption = caption;
    user.profilePhoto = profilePhoto;

    await user.save();

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        profilePhoto: user.profilePhoto || "",
        caption: user.caption || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = { getContacts, getChatUsers, updateProfile };
import User from "../models/User.js";
import Entry from "../models/Entry.js";
import { publicUser } from "./authController.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Finds the requested user and works out whether the viewer may see their data
async function loadProfileUser(req, res) {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return null;
  }
  const isOwner = Boolean(req.user && req.user._id.equals(user._id));
  const visible = isOwner || user.isPublic !== false;
  return { user, isOwner, visible };
}

export async function searchUsers(req, res) {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json({ users: [] });

  try {
    const users = await User.find({
      username: new RegExp(`^${escapeRegex(q)}`, "i"),
      isPublic: { $ne: false },
    })
      .select("username")
      .sort("username")
      .limit(10);

    res.json({ users: users.map((u) => ({ username: u.username })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getProfile(req, res) {
  try {
    const found = await loadProfileUser(req, res);
    if (!found) return;
    const { user, isOwner, visible } = found;

    res.json({
      user: {
        username: user.username,
        createdAt: user.createdAt,
        isPublic: user.isPublic !== false,
      },
      isOwner,
      isPrivate: !visible,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getProfileEntries(req, res) {
  try {
    const found = await loadProfileUser(req, res);
    if (!found) return;
    if (!found.visible) {
      return res.status(403).json({ message: "This profile is private" });
    }

    const entries = await Entry.find({ user: found.user._id })
      .select("-notes") // private notes never leave the server
      .populate("item")
      .sort({ updatedAt: -1 });

    res.json({ entries: entries.filter((e) => e.item) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateMe(req, res) {
  if (typeof req.body.isPublic !== "boolean") {
    return res.status(400).json({ message: "isPublic must be true or false" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isPublic: req.body.isPublic },
      { new: true }
    );
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
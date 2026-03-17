/**
 * In-memory store.
 * In production swap this module with a Redis client
 * without touching any other file — interface stays identical.
 */

const rooms = {};

const createRoom = (roomId, roomName, teacherName) => {
  rooms[roomId] = {
    id: roomId,
    name: roomName,
    teacherName,
    students: [],
    reactions: { got_it: 0, confused: 0, too_fast: 0, repeat: 0 },
    attentionScores: {},
    raisedHands: [],
    createdAt: Date.now(),
  };
  return rooms[roomId];
};

const getRoom = (roomId) => rooms[roomId] ?? null;
const getAllRooms = () => Object.values(rooms);

const VALID_REACTIONS = new Set(["got_it", "confused", "too_fast", "repeat"]);

const addStudent = (roomId, name) => {
  if (!rooms[roomId]) return;
  if (rooms[roomId].students.includes(name)) return;
  rooms[roomId].students.push(name);
};

const removeStudent = (roomId, name) => {
  if (!rooms[roomId]) return;
  rooms[roomId].students = rooms[roomId].students.filter((s) => s !== name);
};

const updateReaction = (roomId, type) => {
  if (!rooms[roomId]) return;
  if (!VALID_REACTIONS.has(type)) return;
  rooms[roomId].reactions[type] += 1;
};

const updateAttention = (roomId, studentName, score) => {
  if (!rooms[roomId]) return;
  if (typeof score !== "number") return;
  if (score < 0 || score > 100) return;
  rooms[roomId].attentionScores[studentName] = Math.round(score);
};

const raiseHand = (roomId, name) => {
  if (!rooms[roomId]) return;
  if (rooms[roomId].raisedHands.includes(name)) return;
  rooms[roomId].raisedHands.push(name);
};

const lowerHand = (roomId, name) => {
  if (!rooms[roomId]) return;
  rooms[roomId].raisedHands = rooms[roomId].raisedHands.filter(
    (s) => s !== name,
  );
};

module.exports = {
  createRoom,
  getRoom,
  getAllRooms,
  addStudent,
  removeStudent,
  updateReaction,
  updateAttention,
  raiseHand,
  lowerHand,
};

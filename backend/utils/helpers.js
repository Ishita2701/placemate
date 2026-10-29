const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const isObjectId = (value) => typeof value === 'string' && OBJECT_ID_REGEX.test(value);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A job stays open for the whole deadline day (deadlines are stored as dates at 00:00 UTC).
const isExpired = (deadline) => new Date(deadline).getTime() + 24 * 60 * 60 * 1000 <= Date.now();

// Converts a Mongoose job document into the JSON shape sent to the frontend.
function serializeJob(job) {
  const { _id, __v, ...rest } = job.toObject ? job.toObject() : job;
  return { id: String(_id), ...rest, recruiter: String(rest.recruiter), isExpired: isExpired(rest.deadline) };
}

module.exports = { isObjectId, escapeRegex, isExpired, serializeJob };

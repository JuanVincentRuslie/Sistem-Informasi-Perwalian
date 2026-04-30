/**
 * Helper pagination untuk offset-based query.
 * Sesuai API spec: ?page=1&limit=20
 */

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}

module.exports = { parsePagination, buildMeta };
